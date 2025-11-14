import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // uses service role for admin writes
);

export async function POST(req: Request) {
  const form = await req.formData();

  const csvFile = form.get("csv") as File;
  if (!csvFile) {
    return NextResponse.json({ error: "Missing CSV" }, { status: 400 });
  }

  const logs: string[] = [];

  const pushLog = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  // Parse CSV
  const csvText = await csvFile.text();
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  // Uploaded files
  const audioFiles = form.getAll("songs") as File[];
  const imageFiles = form.getAll("images") as File[];

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

    if (!audio_file || !title || !artist_name) {
      pushLog(`Skipping row - missing required fields: ${JSON.stringify(row)}`);
      continue;
    }

    pushLog(`Processing: ${title} by ${artist_name}`);

    // -------- Artist Handling --------
    let { data: artist, error: artistErr } = await supabase
      .from("artists")
      .select("*")
      .eq("name", artist_name)
      .maybeSingle();

    if (!artist) {
      const { data, error } = await supabase
        .from("artists")
        .insert({
          name: artist_name,
          bio: artist_bio || null,
          avatar_path: null,
          hero_path: null,
        })
        .select()
        .single();

      artist = data;
      pushLog(`Created artist: ${artist_name}`);
    }

    // -------- Upload Audio --------
    const audioMatch = findFile(audio_file, audioFiles);
    if (!audioMatch) {
      pushLog(`Missing audio file: ${audio_file}, skipping song.`);
      continue;
    }

    const audioUpload = await supabase.storage
      .from("songs")
      .upload(`imports/${Date.now()}-${audio_file}`, audioMatch, {
        cacheControl: "3600",
        upsert: false,
      });

    if (audioUpload.error) {
      pushLog(`Audio upload FAILED: ${audio_file}`);
      continue;
    }

    const audioPath = audioUpload.data.path;

    // -------- Upload Image (optional) --------
    let imagePath: string | null = null;

    if (image_file) {
      const imageMatch = findFile(image_file, imageFiles);

      if (imageMatch) {
        const imageUpload = await supabase.storage
          .from("images")
          .upload(`imports/${Date.now()}-${image_file}`, imageMatch, {
            cacheControl: "3600",
            upsert: false,
          });

        if (!imageUpload.error) {
          imagePath = imageUpload.data.path;
          pushLog(`Image uploaded: ${image_file}`);
        } else {
          pushLog(`Image upload failed: ${image_file}`);
        }
      } else {
        pushLog(`Image file not provided for: ${image_file}`);
      }
    }

    // -------- Create Song --------
    const { data: song, error: songErr } = await supabase
      .from("songs")
      .insert({
        title,
        author: artist_name,
        artist_id: artist.id,
        image_path: imagePath,
        song_path: audioPath,
      })
      .select()
      .single();

    pushLog(`Created song: ${song.title}`);

    // -------- Playlist Handling (optional) --------
    if (playlist_name) {
      let { data: playlist } = await supabase
        .from("playlists")
        .select("*")
        .eq("name", playlist_name)
        .maybeSingle();

      if (!playlist) {
        const { data } = await supabase
          .from("playlists")
          .insert({ name: playlist_name, description: null, image_path: null })
          .select()
          .single();
        playlist = data;
        pushLog(`Created playlist: ${playlist_name}`);
      }

      await supabase.from("playlist_songs").insert({
        playlist_id: playlist.id,
        song_id: song.id,
        position: playlist_position ? Number(playlist_position) : null,
      });

      pushLog(`Added to playlist: ${playlist_name}`);
    }
  }

  pushLog("IMPORT COMPLETE.");
  return NextResponse.json({ logs });
}
