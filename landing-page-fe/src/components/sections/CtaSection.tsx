export default function CtaSection({ content }: { content: any }) {
  return (
    <section className="bg-blue-600 text-white py-16">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl font-bold mb-4">{content.heading}</h2>
        {content.buttonText && (
          <a
            href={content.buttonLink || "#"}
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 inline-block mt-4"
          >
            {content.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}
