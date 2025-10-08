export default function Home() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg shadow">
        <img src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=1800&auto=format&fit=crop" alt="Volunteer" className="w-full h-[60vh] object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center">
          <div className="max-w-3xl mx-auto px-6 text-white">
            <h1 className="text-4xl md:text-5xl font-bold">Chung tay vì cộng đồng</h1>
            <p className="mt-3 text-lg">Khám phá các hoạt động tình nguyện, kết nối và tạo tác động tích cực.</p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Khoảnh khắc tình nguyện</h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[
            'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1472653431158-6364773b2a56?q=80&w=1200&auto=format&fit=crop'
          ].map((src, i) => (
            <img key={i} src={src} alt="Volunteer moment" className="w-full h-40 md:h-48 object-cover rounded" />
          ))}
        </div>
      </section>
    </div>
  )
}


