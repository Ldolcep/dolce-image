export default function Hero() {
  return (
    <section className="w-full h-screen overflow-hidden">
      {/* Video Full Screen */}
      <div className="w-full h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/hero-video/dolce-banner.mp4" type="video/mp4" />
          {/* Fallback pour les navigateurs qui ne supportent pas la vidéo */}
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  )
}