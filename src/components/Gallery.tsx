import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera } from "lucide-react";

import van1 from "@/assets/gallery/van-1.jpg";
import van2 from "@/assets/gallery/van-2.jpg";
import van3 from "@/assets/gallery/van-3.jpg";
import van4 from "@/assets/gallery/van-4.jpg";
import van5 from "@/assets/gallery/van-5.jpg";
import van6 from "@/assets/gallery/van-6.jpg";
import van7 from "@/assets/gallery/van-7.jpg";
import van8 from "@/assets/gallery/van-8.jpg";

const images = [
  { src: van1, alt: "Desert road trip" },
  { src: van2, alt: "Highway journey" },
  { src: van3, alt: "Comfortable interior" },
  { src: van4, alt: "Coastal route" },
  { src: van5, alt: "Our fleet" },
  { src: van6, alt: "City transfer" },
  { src: van7, alt: "Driver cockpit" },
  { src: van8, alt: "Sunset adventure" },
];

const Gallery: React.FC = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4 font-medium">
            <Camera className="w-4 h-4" />
            {t("gallery.badge") || "Our Fleet"}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("gallery.title") || "Travel in Comfort & Style"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("gallery.subtitle") || "Take a look at our modern fleet ready to take you anywhere"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(img.src)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
                i === 0 || i === 5 ? "row-span-2" : ""
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover aspect-square transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all duration-300 flex items-end">
                <span className="text-white font-medium text-sm p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {img.alt}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl p-1 bg-card border-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Gallery preview"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery;
