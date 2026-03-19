import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <section className="py-20 bg-primary text-white text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-headline font-bold mb-4">Crafting Quality Since 2010</h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              We are Mombasa's leading suppliers of premium timber and bespoke handcrafted furniture.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <Image 
                  src="/seats.jpg" 
                  alt="Dockwood Furnitures Craftsmanship" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div>
                <Badge className="bg-accent mb-4">Our Mission</Badge>
                <h2 className="text-4xl font-headline font-bold text-primary mb-6">Built on Quality & Integrity</h2>
                <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    Dockwood Furnitures started as a small timber yard in Bombolulu with a simple vision: to provide high-quality wood and furniture that stands the test of time. 
                    Today, we serve hundreds of clients across Mombasa, from individual homeowners to large construction firms.
                  </p>
                  <p>
                    We source our timber from sustainable forests and treat it with precision. Our team of expert carpenters brings years of experience to every piece of furniture, ensuring that your home feels warm, natural, and sophisticated.
                  </p>
                  <p>
                    Our commitment to same-day delivery and customer satisfaction has made us the go-to shop for furniture in Kisimani and beyond. Whether you need a simple chair or a full suite of beds for a new hotel, we deliver with the same excellence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-headline font-bold mb-12">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Durability", desc: "Our furniture is made to last generations, not just years." },
                { title: "Craftsmanship", desc: "Attention to detail in every joint, finish, and carve." },
                { title: "Reliability", desc: "If we promise same-day delivery, we make it happen." }
              ].map((val, i) => (
                <div key={i} className="bg-white p-10 rounded-2xl shadow-sm border border-border">
                  <h3 className="text-xl font-bold mb-4 text-accent">{val.title}</h3>
                  <p className="text-muted-foreground">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
