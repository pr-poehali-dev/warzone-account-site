import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  products_count: number;
}

interface Product {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  price: string;
  original_price: string | null;
  discount_percent: number;
  level: number;
  kills: number;
  wins: number;
  kd_ratio: string;
  weapons_unlocked: number;
  skins_count: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
}

const PRODUCTS_API = 'https://functions.poehali.dev/e406d026-cac0-433b-8785-93f80aeb59bf';
const CATEGORIES_API = 'https://functions.poehali.dev/2553a877-a56f-4eb5-a03b-32f98098a813';

export default function Index() {
  const [currentPage, setCurrentPage] = useState<'home' | 'catalog' | 'sales' | 'about' | 'contacts' | 'faq' | 'reviews' | 'admin'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    original_price: '',
    discount_percent: '',
    level: '',
    kills: '',
    wins: '',
    kd_ratio: '',
    weapons_unlocked: '',
    skins_count: '',
    image_url: '',
    is_featured: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(PRODUCTS_API),
        fetch(CATEGORIES_API)
      ]);
      
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category_slug === selectedCategory);

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 3);

  const handleAddProduct = async () => {
    try {
      const productData = {
        ...newProduct,
        category_id: parseInt(newProduct.category_id),
        price: parseFloat(newProduct.price),
        original_price: newProduct.original_price ? parseFloat(newProduct.original_price) : null,
        discount_percent: parseInt(newProduct.discount_percent || '0'),
        level: parseInt(newProduct.level),
        kills: parseInt(newProduct.kills),
        wins: parseInt(newProduct.wins),
        kd_ratio: parseFloat(newProduct.kd_ratio),
        weapons_unlocked: parseInt(newProduct.weapons_unlocked),
        skins_count: parseInt(newProduct.skins_count)
      };

      const response = await fetch(PRODUCTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        toast.success('Товар добавлен!');
        setAdminOpen(false);
        fetchData();
        setNewProduct({
          title: '',
          description: '',
          category_id: '',
          price: '',
          original_price: '',
          discount_percent: '',
          level: '',
          kills: '',
          wins: '',
          kd_ratio: '',
          weapons_unlocked: '',
          skins_count: '',
          image_url: '',
          is_featured: false
        });
      }
    } catch (error) {
      toast.error('Ошибка при добавлении товара');
    }
  };

  const defaultImages = {
    standard: 'https://cdn.poehali.dev/projects/ae5b6c4b-b4a8-49aa-a125-c88315a7e6bf/files/a5f045c4-1e75-4e17-a52d-6c0256663377.jpg',
    premium: 'https://cdn.poehali.dev/projects/ae5b6c4b-b4a8-49aa-a125-c88315a7e6bf/files/cd126ea2-042e-4de6-95b7-9b21b286cca1.jpg',
    vip: 'https://cdn.poehali.dev/projects/ae5b6c4b-b4a8-49aa-a125-c88315a7e6bf/files/0713b293-6b5e-4fe8-b2d3-216b7d98e38c.jpg'
  };

  const getProductImage = (product: Product) => {
    if (product.image_url) return product.image_url;
    return defaultImages[product.category_slug as keyof typeof defaultImages] || defaultImages.standard;
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Gamepad2" size={32} className="text-primary" />
            <h1 className="text-2xl font-bold">WARZONE SHOP</h1>
          </div>
          
          <nav className="hidden md:flex gap-6">
            <button onClick={() => setCurrentPage('home')} className={`hover:text-primary transition-colors ${currentPage === 'home' ? 'text-primary' : ''}`}>
              Главная
            </button>
            <button onClick={() => setCurrentPage('catalog')} className={`hover:text-primary transition-colors ${currentPage === 'catalog' ? 'text-primary' : ''}`}>
              Каталог
            </button>
            <button onClick={() => setCurrentPage('sales')} className={`hover:text-primary transition-colors ${currentPage === 'sales' ? 'text-primary' : ''}`}>
              Акции
            </button>
            <button onClick={() => setCurrentPage('about')} className={`hover:text-primary transition-colors ${currentPage === 'about' ? 'text-primary' : ''}`}>
              О нас
            </button>
            <button onClick={() => setCurrentPage('contacts')} className={`hover:text-primary transition-colors ${currentPage === 'contacts' ? 'text-primary' : ''}`}>
              Контакты
            </button>
            <button onClick={() => setCurrentPage('faq')} className={`hover:text-primary transition-colors ${currentPage === 'faq' ? 'text-primary' : ''}`}>
              FAQ
            </button>
            <button onClick={() => setCurrentPage('reviews')} className={`hover:text-primary transition-colors ${currentPage === 'reviews' ? 'text-primary' : ''}`}>
              Отзывы
            </button>
          </nav>

          <Button onClick={() => setCurrentPage('admin')} variant="outline" size="sm">
            <Icon name="Settings" size={16} className="mr-2" />
            Админ
          </Button>
        </div>
      </header>

      <main className="container py-8">
        {currentPage === 'home' && (
          <div className="space-y-12">
            <section className="relative h-[500px] rounded-2xl overflow-hidden">
              <img 
                src={defaultImages.premium} 
                alt="Hero" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/40 flex items-center">
                <div className="max-w-2xl px-8">
                  <h2 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
                    ПРОКАЧАННЫЕ АККАУНТЫ WARZONE
                  </h2>
                  <p className="text-xl text-muted-foreground mb-6">
                    Начни доминировать с первой секунды. Топовые аккаунты с максимальной прокачкой и редкими скинами.
                  </p>
                  <Button size="lg" onClick={() => setCurrentPage('catalog')} className="text-lg">
                    <Icon name="ShoppingCart" size={20} className="mr-2" />
                    Смотреть каталог
                  </Button>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-bold">🔥 Топовые предложения</h3>
                <Button variant="link" onClick={() => setCurrentPage('catalog')}>
                  Все товары <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredProducts.map(product => (
                  <Card key={product.id} className="overflow-hidden hover-scale group cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={getProductImage(product)} 
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {product.discount_percent > 0 && (
                        <Badge className="absolute top-2 right-2 bg-destructive">
                          -{product.discount_percent}%
                        </Badge>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{product.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Icon name="TrendingUp" size={14} className="text-primary" />
                          <span>Уровень {product.level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="Target" size={14} className="text-accent" />
                          <span>K/D {product.kd_ratio}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="Zap" size={14} className="text-secondary" />
                          <span>{product.kills.toLocaleString()} киллов</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="Trophy" size={14} className="text-primary" />
                          <span>{product.wins} побед</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <div className="flex flex-col">
                        {product.original_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {parseFloat(product.original_price).toLocaleString()}₽
                          </span>
                        )}
                        <span className="text-2xl font-bold text-primary">
                          {parseFloat(product.price).toLocaleString()}₽
                        </span>
                      </div>
                      <Button>Купить</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map(category => (
                <Card key={category.id} className="hover-scale cursor-pointer" onClick={() => { setSelectedCategory(category.slug); setCurrentPage('catalog'); }}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon name={category.icon as any} size={24} className="text-primary" />
                      </div>
                      <div>
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription>{category.products_count} товаров</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </section>
          </div>
        )}

        {currentPage === 'catalog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold">Каталог аккаунтов</h2>
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="all">Все</TabsTrigger>
                {categories.map(cat => (
                  <TabsTrigger key={cat.slug} value={cat.slug}>
                    <Icon name={cat.icon as any} size={16} className="mr-2" />
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-6">
                {loading ? (
                  <div className="text-center py-12">Загрузка...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                      <Card key={product.id} className="overflow-hidden hover-scale group cursor-pointer">
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={getProductImage(product)} 
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          {product.discount_percent > 0 && (
                            <Badge className="absolute top-2 right-2 bg-destructive">
                              -{product.discount_percent}%
                            </Badge>
                          )}
                          <Badge className="absolute top-2 left-2 bg-secondary">
                            {product.category_name}
                          </Badge>
                        </div>
                        <CardHeader>
                          <CardTitle className="line-clamp-1">{product.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Icon name="TrendingUp" size={14} className="text-primary" />
                              <span>Уровень {product.level}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon name="Target" size={14} className="text-accent" />
                              <span>K/D {product.kd_ratio}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon name="Zap" size={14} className="text-secondary" />
                              <span>{product.kills.toLocaleString()} киллов</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon name="Trophy" size={14} className="text-primary" />
                              <span>{product.wins} побед</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon name="Crosshair" size={14} className="text-muted-foreground" />
                              <span>{product.weapons_unlocked} оружия</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon name="Palette" size={14} className="text-muted-foreground" />
                              <span>{product.skins_count} скинов</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                          <div className="flex flex-col">
                            {product.original_price && (
                              <span className="text-sm text-muted-foreground line-through">
                                {parseFloat(product.original_price).toLocaleString()}₽
                              </span>
                            )}
                            <span className="text-2xl font-bold text-primary">
                              {parseFloat(product.price).toLocaleString()}₽
                            </span>
                          </div>
                          <Button>Купить</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {currentPage === 'sales' && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold mb-6">🔥 Акции и спецпредложения</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p => p.discount_percent > 0).map(product => (
                <Card key={product.id} className="overflow-hidden hover-scale group cursor-pointer border-2 border-primary/50">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={getProductImage(product)} 
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <Badge className="absolute top-2 right-2 bg-destructive text-lg px-3 py-1">
                      -{product.discount_percent}%
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle>{product.title}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground line-through">
                        {product.original_price && parseFloat(product.original_price).toLocaleString()}₽
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {parseFloat(product.price).toLocaleString()}₽
                      </span>
                    </div>
                    <Button>Купить</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'about' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold mb-6">О нас</h2>
            <Card>
              <CardHeader>
                <CardTitle>WARZONE SHOP - Лучшие аккаунты для игры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>Мы специализируемся на продаже качественных прокачанных аккаунтов для Call of Duty: Warzone.</p>
                <p>Наши преимущества:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Только проверенные аккаунты</li>
                  <li>Гарантия безопасности</li>
                  <li>Моментальная передача</li>
                  <li>Лучшие цены на рынке</li>
                  <li>Поддержка 24/7</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === 'contacts' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Контакты</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Icon name="Mail" size={20} className="text-primary" />
                  <span>support@warzoneshop.ru</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="MessageCircle" size={20} className="text-primary" />
                  <span>Telegram: @warzoneshop</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Phone" size={20} className="text-primary" />
                  <span>+7 (999) 123-45-67</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === 'faq' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Частые вопросы</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Как происходит передача аккаунта?</AccordionTrigger>
                <AccordionContent>
                  После оплаты вы получаете данные для входа (логин и пароль) на указанную почту в течение 5 минут.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Есть ли гарантия?</AccordionTrigger>
                <AccordionContent>
                  Да, на все аккаунты предоставляется гарантия 30 дней. Мы вернём деньги, если возникнут проблемы.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Можно ли вернуть товар?</AccordionTrigger>
                <AccordionContent>
                  Возврат возможен в течение 24 часов, если аккаунт не соответствует описанию.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Какие способы оплаты доступны?</AccordionTrigger>
                <AccordionContent>
                  Принимаем карты (Visa/MasterCard/Mir), электронные кошельки, криптовалюту.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {currentPage === 'reviews' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Отзывы клиентов</h2>
            <div className="space-y-4">
              {[
                { name: 'Игорь К.', rating: 5, text: 'Отличный аккаунт! Всё как в описании, передали за 3 минуты.' },
                { name: 'Максим В.', rating: 5, text: 'Покупал VIP аккаунт - пушка! Все скины на месте, рекомендую.' },
                { name: 'Дмитрий П.', rating: 4, text: 'Хороший сервис, цены адекватные. Взял премиум аккаунт для стримов.' }
              ].map((review, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{review.name}</CardTitle>
                      <div className="flex gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Icon key={i} name="Star" size={16} className="text-primary fill-primary" />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{review.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'admin' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold">Админ-панель</h2>
              <Button onClick={() => setAdminOpen(true)}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить товар
              </Button>
            </div>

            <div className="grid gap-4">
              {products.map(product => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{product.title}</CardTitle>
                        <CardDescription>{product.category_name} - {parseFloat(product.price).toLocaleString()}₽</CardDescription>
                      </div>
                      <Badge variant={product.is_available ? 'default' : 'secondary'}>
                        {product.is_available ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>Уровень: {product.level}</div>
                      <div>K/D: {product.kd_ratio}</div>
                      <div>Киллы: {product.kills.toLocaleString()}</div>
                      <div>Победы: {product.wins}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить новый товар</DialogTitle>
            <DialogDescription>Заполните информацию о новом аккаунте</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input value={newProduct.title} onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Описание</Label>
              <Textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Категория</Label>
                <Select value={newProduct.category_id} onValueChange={(v) => setNewProduct({...newProduct, category_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Цена (₽)</Label>
                <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Старая цена (₽)</Label>
                <Input type="number" value={newProduct.original_price} onChange={(e) => setNewProduct({...newProduct, original_price: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Скидка (%)</Label>
                <Input type="number" value={newProduct.discount_percent} onChange={(e) => setNewProduct({...newProduct, discount_percent: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Уровень</Label>
                <Input type="number" value={newProduct.level} onChange={(e) => setNewProduct({...newProduct, level: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Киллы</Label>
                <Input type="number" value={newProduct.kills} onChange={(e) => setNewProduct({...newProduct, kills: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Победы</Label>
                <Input type="number" value={newProduct.wins} onChange={(e) => setNewProduct({...newProduct, wins: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>K/D соотношение</Label>
                <Input type="number" step="0.1" value={newProduct.kd_ratio} onChange={(e) => setNewProduct({...newProduct, kd_ratio: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Оружия</Label>
                <Input type="number" value={newProduct.weapons_unlocked} onChange={(e) => setNewProduct({...newProduct, weapons_unlocked: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Скинов</Label>
                <Input type="number" value={newProduct.skins_count} onChange={(e) => setNewProduct({...newProduct, skins_count: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>URL изображения</Label>
              <Input value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="featured" 
                checked={newProduct.is_featured}
                onChange={(e) => setNewProduct({...newProduct, is_featured: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="featured" className="cursor-pointer">Показать в топовых предложениях</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminOpen(false)}>Отмена</Button>
            <Button onClick={handleAddProduct}>Добавить товар</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t mt-12 py-8">
        <div className="container text-center text-muted-foreground">
          <p>© 2024 WARZONE SHOP. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
