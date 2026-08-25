export default function HeroSection({ content }: { content: any }) {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold mb-4">{content.heading}</h1>
        <p className="text-xl mb-8">{content.subheading}</p>
        {content.buttonText && (
          <a
            href={content.buttonLink || "#"}
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100"
          >
            {content.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}
