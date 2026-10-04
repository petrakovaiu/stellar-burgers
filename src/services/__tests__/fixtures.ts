import type { TIngredient, TConstructorState } from '../../utils/types';

export const bun: TIngredient = {
  _id: 'bun-1',
  name: 'Тестовая булка',
  type: 'bun',
  proteins: 12,
  fat: 7,
  carbohydrates: 31,
  calories: 240,
  price: 100,
  image:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="40"%3E%3Crect width="80" height="40" fill="orange"/%3E%3C/svg%3E',
  image_large:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="40"%3E%3Crect width="80" height="40" fill="orange"/%3E%3C/svg%3E',
  image_mobile:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="40"%3E%3Crect width="80" height="40" fill="orange"/%3E%3C/svg%3E',
};
export const main: TIngredient = {
  ...bun,
  _id: 'main-1',
  name: 'Тестовая котлета',
  type: 'main',
  price: 50,
};
export const sauce: TIngredient = {
  ...bun,
  _id: 'sauce-1',
  name: 'Тестовый соус',
  type: 'sauce',
  price: 25,
};
export const filledConstructor: TConstructorState = {
  bun: { ...bun, id: 'bun-instance' },
  ingredients: [
    { ...main, id: 'first' },
    { ...sauce, id: 'second' },
    { ...main, id: 'third' },
  ],
};
export const orderResponse = {
  success: true,
  name: 'Тестовый бургер',
  order: {
    _id: 'order-1',
    status: 'done',
    name: 'Тестовый бургер',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    number: 123456,
    ingredients: ['bun-1', 'main-1', 'sauce-1', 'bun-1'],
  },
};
