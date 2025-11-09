-- Создание таблицы категорий
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы товаров (аккаунтов)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    discount_percent INTEGER DEFAULT 0,
    level INTEGER,
    kills INTEGER,
    wins INTEGER,
    kd_ratio DECIMAL(4, 2),
    weapons_unlocked INTEGER,
    skins_count INTEGER,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(200),
    status VARCHAR(50) DEFAULT 'pending',
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальных категорий
INSERT INTO categories (name, slug, description, icon) VALUES
('Стандарт', 'standard', 'Базовые аккаунты для начинающих игроков', 'Shield'),
('Премиум', 'premium', 'Прокачанные аккаунты с хорошей статистикой', 'Star'),
('VIP', 'vip', 'Топовые аккаунты с максимальной прокачкой', 'Crown');

-- Вставка тестовых товаров
INSERT INTO products (title, description, category_id, price, original_price, discount_percent, level, kills, wins, kd_ratio, weapons_unlocked, skins_count, is_featured, is_available) VALUES
('Warzone Starter Account', 'Отличный старт для новичков. Аккаунт с базовой прокачкой и открытым оружием.', 1, 499, 699, 29, 45, 1250, 15, 1.2, 15, 5, true, true),
('Pro Gamer Account', 'Прокачанный аккаунт с высоким K/D и множеством побед.', 2, 1499, 1999, 25, 120, 8500, 145, 2.8, 45, 35, true, true),
('Ultimate Elite Account', 'ТОП аккаунт с максимальной прокачкой, редкими скинами и Damascus камуфляжем.', 3, 4999, 6999, 29, 250, 25000, 450, 4.2, 85, 120, true, true),
('Mid-Level Account', 'Средний уровень с хорошей базой для дальнейшего развития.', 1, 899, NULL, 0, 75, 3200, 45, 1.8, 28, 12, false, true),
('Premium Streamer Account', 'Идеально для стримеров - высокая статистика и красивые скины.', 2, 2499, 2999, 17, 155, 12500, 220, 3.1, 60, 68, true, true),
('VIP Legendary Account', 'Легендарный аккаунт с полной коллекцией оружия и эксклюзивными скинами.', 3, 7999, NULL, 0, 300, 35000, 680, 5.5, 95, 200, false, true);