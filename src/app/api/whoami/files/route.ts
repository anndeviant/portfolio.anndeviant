import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getStorageFilePublicUrl,
  getSupabaseAdminClient,
  STORAGE_BUCKET,
  STORAGE_FOLDER,
} from "../../../../lib/supabase-admin";
import { verifySessionToken, WHOAMI_COOKIE_NAME } from "../../../../lib/whoami-auth";

export const runtime = "edge";

async function isAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(WHOAMI_COOKIE_NAME);
  return await verifySessionToken(sessionCookie?.value);
}

export async function GET() {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to vault." },
        { status: 401 },
      );
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(STORAGE_FOLDER, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    const files = (data || [])
      .filter((item) => item.name && !item.name.startsWith("."))
      .map((item) => ({
        id: item.id,
        name: item.name,
        created_at: item.created_at,
        updated_at: item.updated_at,
        last_accessed_at: item.last_accessed_at,
        metadata: item.metadata,
        publicUrl: getStorageFilePublicUrl(item.name),
      }));

    return NextResponse.json({
      success: true,
      files,
      bucket: STORAGE_BUCKET,
      folder: STORAGE_FOLDER,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error listing files";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to vault." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No valid file uploaded." },
        { status: 400 },
      );
    }

    const originalName = file.name;
    const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${STORAGE_FOLDER}/${cleanName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: `${error.message}. Please check SUPABASE_SERVICE_ROLE_KEY or Storage RLS.`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      fileName: cleanName,
      publicUrl: getStorageFilePublicUrl(cleanName),
      data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error uploading file";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to vault." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { fileName } = body as { fileName?: string };

    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json(
        { success: false, error: "File name is required." },
        { status: 400 },
      );
    }

    const cleanName = fileName.replace(/^[/\\]+/, "");
    const filePath = `${STORAGE_FOLDER}/${cleanName}`;

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error deleting file";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
