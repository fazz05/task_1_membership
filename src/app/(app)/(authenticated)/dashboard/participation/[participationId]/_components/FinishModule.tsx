import { Course, Participation } from "@/payload-types";
import { useState } from "react";
import NextButton from "./NextButton";
import axios from "axios";

export default function FinishModule({ participation }: { participation: Participation }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const course = participation.course as Course;

      const res = await axios.get(`/printCertificate/${participation.id}`, {
        responseType: 'blob',
        validateStatus: () => true,
        })
        if (res.status !== 200) {
        const text = await res.data.text?.()
        alert(text || `Download failed (${res.status})`)
        return
        }
        const url = URL.createObjectURL(res.data)
        const a = document.createElement('a')
        a.href = url
        a.download = `Certificate-${(participation.course as Course).title}.pdf` // <- ada titik
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)

    } catch (err) {
      console.error(err);
      alert('Unexpected error while downloading certificate');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Congratulations!</h1>
      <p className="text-gray-400">You Have Complete the course.</p>
      <NextButton loading={loading} text="Download Certificate" onClick={handleDownload} />
    </div>
  );
}
