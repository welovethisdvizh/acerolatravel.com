# Требования к изображениям Acerola Expedition Bureau

Все изображения на сайте Acerola Expedition Bureau должны соответствовать высокому качеству, сохранять ощущение Севера, снега и чистого воздуха. 

## 1. Технические правила форматирования

- **Lazy Loading:** Для всех контентных изображений ниже первого экрана обязателен атрибут `loading="lazy"`.
- **Object-Fit & Positioning:** Во избежание искажений пропорций для всех `<img>` в CSS заданы:
  - `object-fit: cover;`
  - `object-position: center;` (или `50% 45%` для портретов гидов).
- **Alt-атрибуты:** Все изображения должны содержать понятные текстовые описания `alt` на русском языке для соответствия стандартам доступности (a11y).
- **Оптимизация:** Рекомендуется сжимать изображения и использовать современные форматы (`.webp` или `.png` с высокой компрессией) для поддержания скорости загрузки страниц.

---

## 2. Перечень ключевых изображений проекта

### Карты каталога экспедиций (Каталог «Маршрутные досье»)
- `assets/images/card-pripolyarny.png` (Манарага и Народная)
- `assets/images/card-dyatlov.png` (Перевал Дятлова)
- `assets/images/card-manypupuner.png` (Плато Маньпупунёр)
- `assets/images/card-dikson.png` (Диксон Арктика)
- `assets/images/card-weekend.jpeg` (Weekend North)
- `assets/images/card-custom.png` (Свой маршрут)

### Фоновые и текстурные изображения
- `assets/images/logo.png` (Фирменный знак Acerola Bureau в header/footer)
- `assets/images/topo_pattern.png` (Топографический паттерн на фоне Hero и Route Map)
- `assets/images/rock-map-bg.png` (Эффект скалы под картой этапов)

### Схемы регионов (Route Map Backgrounds)
- `assets/images/map-bg-pripolyarny.png`
- `assets/images/map-bg-dyatlov.png`
- `assets/images/map-bg-manypupuner.png`
- `assets/images/map-bg-dikson.png`
- `assets/images/map-bg-weekend.png`
- `assets/images/map-bg-custom.png`

### Слайды среды и преимуществ (Операционные модули)
- `assets/images/comfort-lodging.png` (База и восстановление)
- `assets/images/comfort-food.png` (Питание и привалы)
- `assets/images/comfort-transport.png` (Техника и сопровождение)
- `assets/images/about_expedition.png` (Главный слайд в "О нас")

### Команда сопровождения
- `assets/images/guide-konstantin.png` (Аватар Константина Кузнецова)
- `assets/images/guide-mikhail.png` (Аватар Михаила Берсенёва)
