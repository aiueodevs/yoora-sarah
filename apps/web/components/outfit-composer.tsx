"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

export function OutfitComposer() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/v1/ai/stylist/templates")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTemplates(data);
        } else {
          setTemplates([]);
        }
      })
      .catch(() => setTemplates([]));
  }, []);

  const selectTemplate = async (template: Template) => {
    setSelectedTemplate(template);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/ai/stylist/templates/${template.id}/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        Outfit Composer
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => selectTemplate(template)}
            className={`p-4 rounded-xl border text-left transition ${
              selectedTemplate?.id === template.id
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            <span className="text-2xl">{template.icon}</span>
            <p className="font-medium mt-2">{template.name}</p>
            <p className="text-xs text-neutral-500">{template.description}</p>
          </button>
        ))}
      </div>

      {products.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-3">Produk dalam outfit ini:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-neutral-500">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}