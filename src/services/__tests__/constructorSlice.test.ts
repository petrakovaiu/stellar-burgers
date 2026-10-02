import reducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
} from '../constructorSlice';
import { createOrder } from '../orderSlice';
import { bun, main, sauce, filledConstructor, orderResponse } from './fixtures';

const emptyState = { bun: null, ingredients: [] };

describe('Редьюсер burgerConstructor', () => {
  test('возвращает начальное состояние для undefined и неизвестного экшена', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(emptyState);
  });

  test('сохраняет существующее состояние для неизвестного экшена', () => {
    expect(reducer(filledConstructor, { type: 'UNKNOWN' })).toBe(filledConstructor);
  });

  describe('addIngredient', () => {
    test('добавляет булку отдельно от начинки', () => {
      const action = addIngredient(bun);
      expect(reducer(emptyState, action)).toEqual({
        bun: action.payload,
        ingredients: [],
      });
    });

    test('заменяет прежнюю булку и сохраняет начинку', () => {
      const action = addIngredient({ ...bun, _id: 'bun-2', name: 'Другая булка' });
      expect(reducer(filledConstructor, action)).toEqual({
        ...filledConstructor,
        bun: action.payload,
      });
    });

    test.each([main, sauce])('добавляет $type в конец начинки', (ingredient) => {
      const action = addIngredient(ingredient);
      expect(reducer(filledConstructor, action)).toEqual({
        bun: filledConstructor.bun,
        ingredients: [...filledConstructor.ingredients, action.payload],
      });
    });

    test('создаёт разные id для двух экземпляров одного ингредиента', () => {
      const first = addIngredient(main);
      const second = addIngredient(main);
      const state = reducer(reducer(emptyState, first), second);
      expect(first.payload.id).toEqual(expect.any(String));
      expect(first.payload.id).not.toHaveLength(0);
      expect(first.payload.id).not.toBe(second.payload.id);
      expect(state.ingredients).toEqual([first.payload, second.payload]);
      expect(state.ingredients.map((item) => item._id)).toEqual([
        main._id,
        main._id,
      ]);
    });
  });

  describe('removeIngredient', () => {
    test('удаляет только экземпляр с переданным id, сохраняя булку и дубль', () => {
      expect(reducer(filledConstructor, removeIngredient('first'))).toEqual({
        bun: filledConstructor.bun,
        ingredients: filledConstructor.ingredients.slice(1),
      });
      expect(filledConstructor.ingredients).toHaveLength(3);
    });

    test('не меняет состав при неизвестном id', () => {
      expect(reducer(filledConstructor, removeIngredient('missing'))).toEqual(
        filledConstructor
      );
    });
  });

  describe('moveIngredient', () => {
    test.each([
      [0, 2, ['second', 'third', 'first']],
      [2, 0, ['third', 'first', 'second']],
      [1, 1, ['first', 'second', 'third']],
    ])('перемещает начинку с индекса %s на %s', (fromIndex, toIndex, ids) => {
      const state = reducer(
        filledConstructor,
        moveIngredient({ fromIndex, toIndex })
      );
      expect(state.ingredients.map((item) => item.id)).toEqual(ids);
      expect(state.bun).toEqual(filledConstructor.bun);
      expect(filledConstructor.ingredients.map((item) => item.id)).toEqual([
        'first',
        'second',
        'third',
      ]);
    });

    test('не меняет состояние при отсутствующем исходном индексе', () => {
      expect(
        reducer(filledConstructor, moveIngredient({ fromIndex: 10, toIndex: 0 }))
      ).toEqual(filledConstructor);
    });
  });

  test('clearConstructor удаляет булку и всю начинку', () => {
    expect(reducer(filledConstructor, clearConstructor())).toEqual(emptyState);
  });

  describe('асинхронное создание заказа', () => {
    test('fulfilled очищает конструктор после успешного заказа', () => {
      expect(
        reducer(
          filledConstructor,
          createOrder.fulfilled(
            orderResponse,
            'request',
            orderResponse.order.ingredients
          )
        )
      ).toEqual(emptyState);
    });

    test('pending сохраняет бургер, пока заказ создаётся', () => {
      expect(reducer(filledConstructor, createOrder.pending('request', []))).toBe(
        filledConstructor
      );
    });

    test('rejected сохраняет бургер при ошибке заказа', () => {
      expect(
        reducer(
          filledConstructor,
          createOrder.rejected(new Error('Ошибка'), 'request', [])
        )
      ).toBe(filledConstructor);
    });
  });
});
