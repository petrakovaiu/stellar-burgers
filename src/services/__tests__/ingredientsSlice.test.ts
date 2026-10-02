import reducer, { getIngredients } from '../ingredientsSlice';
import { bun, main } from './fixtures';

describe('Редьюсер ingredients', () => {
  test('возвращает начальное состояние для undefined и неизвестного экшена', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual({
      ingredients: [],
      isLoading: true,
      error: null,
    });
  });

  test('сохраняет существующее состояние для неизвестного экшена', () => {
    const state = { ingredients: [bun], isLoading: false, error: null };
    expect(reducer(state, { type: 'UNKNOWN' })).toBe(state);
  });

  test('pending включает загрузку, сбрасывает ошибку и сохраняет ингредиенты', () => {
    const state = {
      ingredients: [bun],
      isLoading: false,
      error: { message: 'Ошибка' },
    };
    expect(reducer(state, getIngredients.pending('request'))).toEqual({
      ingredients: [bun],
      isLoading: true,
      error: null,
    });
  });

  test('fulfilled заменяет ингредиенты ответом сервера и завершает загрузку', () => {
    const state = { ingredients: [bun], isLoading: true, error: null };
    expect(reducer(state, getIngredients.fulfilled([main], 'request'))).toEqual({
      ingredients: [main],
      isLoading: false,
      error: null,
    });
    expect(state.ingredients).toEqual([bun]);
  });

  test('fulfilled с пустым ответом очищает старый список', () => {
    expect(
      reducer(
        { ingredients: [bun], isLoading: true, error: null },
        getIngredients.fulfilled([], 'request')
      )
    ).toEqual({
      ingredients: [],
      isLoading: false,
      error: null,
    });
  });

  test('rejected сохраняет ошибку, завершает загрузку и не удаляет ингредиенты', () => {
    const action = getIngredients.rejected(new Error('Нет соединения'), 'request');
    expect(
      reducer({ ingredients: [bun], isLoading: true, error: null }, action)
    ).toEqual({
      ingredients: [bun],
      isLoading: false,
      error: action.error,
    });
    expect(action.error.message).toBe('Нет соединения');
  });
});
