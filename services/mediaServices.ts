export async function uploadMedia(uri: string, type: "video" | "audio") {
  const formData = new FormData();
  formData.append("media", {
    uri,
    type: type === "video" ? "video/mp4" : "audio/m4a",
    name: `recording.${type === "video" ? "mp4" : "m4a"}`,
  } as any);

  const res = await fetch("http://<YOUR_BACKEND_IP>:5000/api/media/upload", {
    method: "POST",
    body: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return await res.json();
}
