export default function FeaturesSection({ content }: { content: any }) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {content.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.items?.map((item: any, index: number) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow text-center"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
