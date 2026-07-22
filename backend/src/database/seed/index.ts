import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { appConfig } from "../../config/app";

const prisma = new PrismaClient();

async function main() {
  console.log("[Seed] Starting database seed...");

  const hashedPassword = await bcrypt.hash(
    "admin123",
    appConfig.bcrypt.saltRounds,
  );

  const defaultUsers = [
    {
      name: "Administrador",
      email: "Nicolau@gmail.com",
      password: hashedPassword,
      phone: "+244 900 000 000",
      role: "ADMIN",
    },
    {
      name: "Administrador Padrão",
      email: "admin@angolaexpress.co.ao",
      password: hashedPassword,
      phone: "+244 900 000 000",
      role: "ADMIN",
    },
    {
      name: "Cliente Teste",
      email: "cliente@teste.co.ao",
      password: hashedPassword,
      phone: "+244 900 000 001",
      role: "CUSTOMER",
    },
  ];

  for (const userData of defaultUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        emailVerifiedAt: new Date(),
      },
    });

    if (userData.role === "ADMIN") {
      console.log(`[Seed] Admin created: ${user.email}`);
    } else {
      console.log(`[Seed] Customer created: ${user.email}`);
    }
  }

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "eletronicos" },
      update: {},
      create: {
        name: "Eletrônicos",
        slug: "eletronicos",
        description: "Produtos eletrônicos",
      },
    }),
    prisma.category.upsert({
      where: { slug: "moda" },
      update: {},
      create: {
        name: "Moda",
        slug: "moda",
        description: "Roupas e acessórios",
      },
    }),
    prisma.category.upsert({
      where: { slug: "casa-e-cozinha" },
      update: {},
      create: {
        name: "Casa e Cozinha",
        slug: "casa-e-cozinha",
        description: "Produtos para casa e cozinha",
      },
    }),
    prisma.category.upsert({
      where: { slug: "desporto" },
      update: {},
      create: {
        name: "Desporto",
        slug: "desporto",
        description: "Artigos desportivos",
      },
    }),
    prisma.category.upsert({
      where: { slug: "beleza-e-saude" },
      update: {},
      create: {
        name: "Beleza e Saúde",
        slug: "beleza-e-saude",
        description: "Produtos de beleza e saúde",
      },
    }),
  ]);
  console.log(`[Seed] ${categories.length} categories created`);

  const subcategories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "telemoveis" },
      update: {},
      create: {
        name: "Telemóveis",
        slug: "telemoveis",
        description: "Smartphones e acessórios",
        parentId: categories[0].id,
      },
    }),
    prisma.category.upsert({
      where: { slug: "computadores" },
      update: {},
      create: {
        name: "Computadores",
        slug: "computadores",
        description: "Notebooks e desktops",
        parentId: categories[0].id,
      },
    }),
    prisma.category.upsert({
      where: { slug: "calcados" },
      update: {},
      create: {
        name: "Calçados",
        slug: "calcados",
        description: "Sapatos e ténis",
        parentId: categories[1].id,
      },
    }),
  ]);
  console.log(`[Seed] ${subcategories.length} subcategories created`);

  const brand = await prisma.brand.upsert({
    where: { slug: "generico" },
    update: {},
    create: {
      name: "Genérico",
      slug: "generico",
      description: "Marca genérica",
    },
  });

  const samsung = await prisma.brand.upsert({
    where: { slug: "samsung" },
    update: {},
    create: {
      name: "Samsung",
      slug: "samsung",
      description: "Produtos Samsung",
    },
  });

  const lenovo = await prisma.brand.upsert({
    where: { slug: "lenovo" },
    update: {},
    create: { name: "Lenovo", slug: "lenovo", description: "Produtos Lenovo" },
  });

  await prisma.product.create({
    data: {
      name: "Notebook Lenovo ThinkPad",
      slug: "notebook-lenovo-thinkpad",
      description:
        "Notebook profissional para trabalho e estudo com processador Intel Core i5.",
      fullDescription:
        'Notebook Lenovo ThinkPad com processador Intel Core i5 de 12ª geração, 8GB RAM DDR4, 256GB SSD NVMe, ecrã de 15.6" Full HD, Windows 11 Pro. Ideal para profissionais e estudantes.',
      price: 350000,
      promotionalPrice: 320000,
      sku: "NB-LEN-001",
      code: "LEN-001",
      weight: 2.5,
      stock: 10,
      isFeatured: true,
      categoryId: categories[0].id,
      brandId: lenovo.id,
      images: {
        create: [
          {
            url: "https://picsum.photos/seed/notebook1/600/600",
            alt: "Notebook Lenovo ThinkPad",
            isCover: true,
            sortOrder: 0,
          },
          {
            url: "https://picsum.photos/seed/notebook2/600/600",
            alt: "Notebook Lenovo lateral",
            sortOrder: 1,
          },
          {
            url: "https://picsum.photos/seed/notebook3/600/600",
            alt: "Notebook Lenovo teclado",
            sortOrder: 2,
          },
        ],
      },
      tags: {
        create: [
          { name: "notebook" },
          { name: "lenovo" },
          { name: "promocao" },
          { name: "trabalho" },
          { name: "estudo" },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Smartphone Samsung Galaxy S24",
      slug: "smartphone-samsung-galaxy-s24",
      description:
        "Smartphone Samsung Galaxy S24 com 256GB, câmara 50MP e ecrã Dynamic AMOLED.",
      fullDescription:
        'Samsung Galaxy S24 com ecrã Dynamic AMOLED 2X de 6.2", processador Exynos 2400, 8GB RAM, 256GB armazenamento, câmara tripla de 50MP+12MP+10MP, bateria 4000mAh. Resistente à água IP68.',
      price: 450000,
      sku: "SM-S24-001",
      code: "SAM-001",
      weight: 0.3,
      stock: 15,
      isFeatured: true,
      categoryId: categories[0].id,
      brandId: samsung.id,
      images: {
        create: [
          {
            url: "https://picsum.photos/seed/s24-1/600/600",
            alt: "Samsung Galaxy S24 frente",
            isCover: true,
            sortOrder: 0,
          },
          {
            url: "https://picsum.photos/seed/s24-2/600/600",
            alt: "Samsung Galaxy S24 traseira",
            sortOrder: 1,
          },
        ],
      },
      tags: {
        create: [
          { name: "smartphone" },
          { name: "samsung" },
          { name: "android" },
          { name: "5g" },
          { name: "galaxy" },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Ténis Nike Air Max",
      slug: "tenis-nike-air-max",
      description:
        "Ténis Nike Air Max confortáveis e estilosos para uso diário.",
      fullDescription:
        "Ténis Nike Air Max com amortecimento Air-Sole, cabedal em mesh respirável, sola de borracha durável e design moderno. Perfeito para desporto e uso casual.",
      price: 85000,
      promotionalPrice: 72000,
      sku: "TN-NK-001",
      code: "NK-001",
      weight: 0.8,
      stock: 25,
      isFeatured: true,
      categoryId: categories[1].id,
      brandId: brand.id,
      images: {
        create: [
          {
            url: "https://picsum.photos/seed/nike1/600/600",
            alt: "Ténis Nike Air Max",
            isCover: true,
            sortOrder: 0,
          },
        ],
      },
      tags: {
        create: [
          { name: "tenis" },
          { name: "nike" },
          { name: "desporto" },
          { name: "calcado" },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Frigideira Antiaderente 28cm",
      slug: "frigideira-antiaderente-28cm",
      description: "Frigideira antiaderente de 28cm com revestimento cerâmico.",
      fullDescription:
        "Frigideira antiaderente com revestimento cerâmico de alta qualidade, 28cm de diâmetro, cabo ergonómico anti-choque térmico, compatível com todos os tipos de fogão incluindo indução. Sem PFOA.",
      price: 12500,
      sku: "FC-FR-001",
      code: "FC-001",
      weight: 0.9,
      stock: 50,
      isFeatured: false,
      categoryId: categories[2].id,
      brandId: brand.id,
      images: {
        create: [
          {
            url: "https://picsum.photos/seed/frigideira1/600/600",
            alt: "Frigideira Antiaderente",
            isCover: true,
            sortOrder: 0,
          },
        ],
      },
      tags: {
        create: [
          { name: "cozinha" },
          { name: "frigideira" },
          { name: "casa" },
          { name: "antiaderente" },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Relógio Apple Watch Series 9",
      slug: "relogio-apple-watch-series-9",
      description:
        "Apple Watch Series 9 com ecrã sempre ativo e sensor de saúde.",
      fullDescription:
        "Apple Watch Series 9 com chip S9, ecrã Retina LTPO OLED sempre ativo, sensor de oxigénio no sangue, ECG, acelerómetro de alto G, altímetro sempre ativo. À prova de água 50m.",
      price: 280000,
      sku: "RW-AP-001",
      code: "APL-001",
      weight: 0.15,
      stock: 8,
      isFeatured: true,
      categoryId: categories[0].id,
      brandId: brand.id,
      images: {
        create: [
          {
            url: "https://picsum.photos/seed/watch1/600/600",
            alt: "Apple Watch Series 9",
            isCover: true,
            sortOrder: 0,
          },
        ],
      },
      tags: {
        create: [
          { name: "relogio" },
          { name: "apple" },
          { name: "smartwatch" },
          { name: "tecnologia" },
        ],
      },
    },
  });

  console.log("[Seed] Products created");

  const banners = [
    {
      title: "Bem-vindo à Angola Express",
      subtitle: "Os melhores produtos com os melhores preços",
      image: "https://picsum.photos/seed/banner1/1920/600",
      position: "HERO",
      sortOrder: 0,
    },
    {
      title: "Promoções Imperdíveis",
      subtitle: "Descontos de até 50% em produtos selecionados",
      image: "https://picsum.photos/seed/banner2/1920/600",
      position: "HERO",
      sortOrder: 1,
    },
    {
      title: "Novidades Todas as Semanas",
      subtitle: "Os lançamentos mais recentes acabaram de chegar",
      image: "https://picsum.photos/seed/banner3/1920/600",
      position: "HERO",
      sortOrder: 2,
    },
  ];
  for (const banner of banners) {
    await prisma.banner.create({ data: banner });
  }

  const settings = [
    { key: "store_name", value: "Angola Express", group: "general" },
    {
      key: "store_description",
      value: "A sua loja online de confiança em Angola",
      group: "general",
    },
    { key: "store_phone", value: "+244 900 000 000", group: "contact" },
    {
      key: "store_email",
      value: "contato@angolaexpress.co.ao",
      group: "contact",
    },
    { key: "store_whatsapp", value: "244900000000", group: "contact" },
    { key: "store_address", value: "Luanda, Angola", group: "general" },
    { key: "currency", value: "Kz", group: "general" },
    { key: "currency_code", value: "AOA", group: "general" },
    { key: "delivery_fee", value: "1500", group: "shipping" },
    { key: "free_shipping_min", value: "50000", group: "shipping" },
    { key: "facebook_url", value: "#", group: "social" },
    { key: "instagram_url", value: "#", group: "social" },
    { key: "whatsapp_number", value: "244900000000", group: "social" },
  ];
  for (const s of settings) {
    await prisma.setting.create({ data: s });
  }

  console.log("[Seed] Settings and banners created");
  console.log("[Seed] Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("[Seed] Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
