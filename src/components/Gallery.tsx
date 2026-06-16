import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import { getGallery, STRAPI_URL, type StrapiItem, type GalleryItem } from "@/services/api";

const Gallery: React.FC = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<StrapiItem<GalleryItem>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const items = await getGallery();
        setGalleryItems(items);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Loading gallery...</p>
          </div>
        </div>
      </section>
    );
  }

  if (galleryItems.length === 0) {
    return null; // Don't show gallery section if no items
  }

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
            {t("gallery.subtitle") ||
              "Take a look at our modern fleet ready to take you anywhere"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {galleryItems.map((item, i) => {
            const imageUrl = STRAPI_URL + item.attributes.image.data.attributes.url;
            const caption = item.attributes.caption || item.attributes.image.data.attributes.alternativeText || 'Gallery image';
            
            return (
              <button
                key={item.id}
                onClick={() => setSelectedImage(imageUrl)}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
                  i === 0 || i === 5 ? "row-span-2" : ""
                }`}
              >
                <img
                  src={imageUrl}
                  alt={caption}
                  loading="lazy"
                  className="w-full h-full object-cover aspect-square transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all duration-300 flex items-end">
                  <span className="text-white font-medium text-sm p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {caption}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
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
