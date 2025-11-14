import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use your Supabase environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side only
);

// Simple CSV parser assuming commas, with no crazy quoting
function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(',').map((c) =>
      c.trim().replace(/^"|"$/g, '') // remove simple surrounding quotes
    );
    const row: any = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

export async function POST(req: Request) {
  const form = await req.formData();

  const csvFile = form.get('csv') as File | null;
  if (!csvFile) {
    return NextResponse.json({ error: 'Missing CSV' }, { status: 400 });
  }

  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  // Read CSV text and parse
  const csvText = await csvFile.text();
  const rows = parseCsv(csvText);

  // Uploaded files
  const audioFiles = form.getAll('songs') as File[];
  const imageFiles = form.getAll('images') as File[];

  const findFile = (name: string, files: File[]) =>
    files.find((f) => f.name === name);

  for (const row of rows) {
    const {
      audio_file,
      image_file,
      title,
      artist_name,
      artist_bio,
      playlist_name,
      playlist_position,
    } = row;

    // REQUIRED FIELDS
    if (!audio_file || !title || !artist_name) {
      log(`Skipping row (missing required fields): ${JSON.stringify(row)}`);
      continue;
    }

    log(`Processing "${title}" by "${artist_name}"`);

    // -------- Artist: find or create --------
    let { data: artist, error: artistErr } = await supabase
      .from('artists')
      .select('*')
      .eq('name', artist_name)
      .maybeSingle();

    if (artistErr) {
      log(`  ⚠️ Error querying artist "${artist_name}": ${artistErr.message}`);
    }

    if (!artist) {
      const { data: createdArtist, error: createArtistErr } = await supabase
        .from('artists')
        .insert({
          name: artist_name,
          bio: artist_bio || null, // safe: if blank, becomes null
          avatar_path: null,
          hero_path: null,
        })
        .select('*')
        .single();

      if (createArtistErr || !createdArtist) {
        log(`  ❌ Failed to create artist "${artist_name}": ${createArtistErr?.message}`);
        continue;
      }

      artist = createdArtist;
      log(`  ✅ Created artist: ${artist_name}`);
    }

    // -------- Audio upload --------
    const audioFile = findFile(audio_file, audioFiles);
    if (!audioFile) {
      log(`  ⚠️ Audio file not found in upload: ${audio_file}`);
      continue;
    }

    const audioPath = `imports/${Date.now()}-${audioFile.name}`;
    const { error: audioUploadErr } = await supabase.storage
      .from('songs') // your audio bucket
      .upload(audioPath, audioFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (audioUploadErr) {
      log(`  ❌ Failed to upload audio "${audio_file}": ${audioUploadErr.message}`);
      continue;
    }

    // -------- Image upload (optional) --------
    let imagePath: string | null = null;
    if (image_file) {
      const imageFile = findFile(image_file, imageFiles);
      if (!imageFile) {
        log(`  ⚠️ Image file listed but not uploaded: ${image_file}`);
      } else {
        const imgStoragePath = `imports/${Date.now()}-${imageFile.name}`;
        const { error: imageUploadErr } = await supabase.storage
          .from('images') // your image bucket
          .upload(imgStoragePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (imageUploadErr) {
          log(`  ⚠️ Failed to upload image "${image_file}": ${imageUploadErr.message}`);
        } else {
          imagePath = imgStoragePath;
          log(`  ✅ Uploaded image: ${image_file}`);
        }
      }
    }

    // -------- Create song --------
    const { data: song, error: songErr } = await supabase
      .from('songs')
      .insert({
        title,
        author: artist_name,
        artist_id: artist.id,
        song_path: audioPath,
        image_path: imagePath,
      })
      .select('*')
      .single();

    if (songErr || !song) {
      log(`  ❌ Failed to insert song "${title}": ${songErr?.message}`);
      continue;
    }

    log(`  ✅ Created song: ${song.title}`);

    // -------- Playlist (optional) --------
    if (playlist_name) {
      let { data: playlist, error: playlistErr } = await supabase
        .from('playlists')
        .select('*')
        .eq('name', playlist_name)
        .maybeSingle();

      if (playlistErr) {
        log(`  ⚠️ Error checking playlist "${playlist_name}": ${playlistErr.message}`);
      }

      if (!playlist) {
        const { data: createdPlaylist, error: createPlaylistErr } = await supabase
          .from('playlists')
          .insert({
            name: playlist_name,
            description: null,
            image_path: null,
          })
          .select('*')
          .single();

        if (createPlaylistErr || !createdPlaylist) {
          log(`  ❌ Failed to create playlist "${playlist_name}": ${createPlaylistErr?.message}`);
          continue;
        }

        playlist = createdPlaylist;
        log(`  ✅ Created playlist: ${playlist_name}`);
      }

      const position = playlist_position ? Number(playlist_position) : null;

      const { error: linkErr } = await supabase.from('playlist_songs').insert({
        playlist_id: playlist.id,
        song_id: song.id,
        position: Number.isFinite(position) ? position : null,
      });

      if (linkErr) {
        log(`  ⚠️ Failed to link song to playlist "${playlist_name}": ${linkErr.message}`);
      } else {
        log(`  ✅ Added to playlist "${playlist_name}"`);
      }
    }
  }

  log('✅ IMPORT COMPLETE');
  return NextResponse.json({ logs });
}
