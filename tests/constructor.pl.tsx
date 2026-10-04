import { test, expect, type Page, type Locator } from '@playwright/test';

const bunName = 'Тестовая булка';
const mainName = 'Тестовая котлета';
const mainImage =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2280%22%20height%3D%2240%22%3E%3Crect%20width%3D%2280%22%20height%3D%2240%22%20fill%3D%22brown%22%2F%3E%3C%2Fsvg%3E';
const sauceName = 'Тестовый соус';
const accessToken = 'Bearer fake-access-token';

const ingredientCard = (page: Page, name: string): Locator =>
  page.locator('li').filter({ has: page.getByRole('link', { name, exact: false }) });

const addIngredient = async (page: Page, name: string): Promise<void> => {
  await ingredientCard(page, name)
    .getByRole('button', { name: 'Добавить', exact: true })
    .click();
};

const expectEmptyConstructor = async (page: Page): Promise<void> => {
  const constructor = page.getByTestId('constructor');
  await expect(constructor.getByText('Выберите булки', { exact: true })).toHaveCount(2);
  await expect(constructor.getByText('Выберите начинку', { exact: true })).toBeVisible();
  await expect(page.getByTestId('constructor-bun-1')).toHaveCount(0);
  await expect(page.getByTestId('constructor-bun-2')).toHaveCount(0);
  await expect(page.getByTestId('constructor-ingredients').locator('li')).toHaveCount(1);
  await expect(constructor.getByText(mainName, { exact: true })).toHaveCount(0);
  await expect(constructor.getByText(sauceName, { exact: true })).toHaveCount(0);
  await expect(
    page.getByTestId('order-summ').getByText('0', { exact: true })
  ).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  // Any API request absent from the HAR fails instead of reaching the real backend.
  await page.routeFromHAR('tests/hars/constructor.har', {
    url: '**/api/**',
    notFound: 'abort',
    update: false,
  });
});

test.describe('Добавление ингредиентов в конструктор', () => {
  test('добавляет булку сверху и снизу, котлету и соус в начинку', async ({ page }) => {
    await page.goto('/');
    await expectEmptyConstructor(page);
    await addIngredient(page, bunName);
    await expect(page.getByTestId('constructor-bun-1')).toContainText(
      `${bunName} (верх)`
    );
    await expect(page.getByTestId('constructor-bun-2')).toContainText(
      `${bunName} (низ)`
    );
    await addIngredient(page, mainName);
    await addIngredient(page, sauceName);
    const filling = page.getByTestId('constructor-ingredients');
    await expect(filling.locator('li')).toHaveCount(2);
    await expect(filling).toContainText(mainName);
    await expect(filling).toContainText(sauceName);
    await expect(
      page.getByTestId('order-summ').getByText('275', { exact: true })
    ).toBeVisible();
  });
});

test.describe('Модальное окно ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await ingredientCard(page, mainName).getByRole('link').click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('показывает название, изображение и пищевую ценность выбранного ингредиента', async ({
    page,
  }) => {
    const modal = page.getByRole('dialog');
    await expect(page).toHaveURL(/\/ingredients\/main-1$/);
    await expect(
      modal.getByRole('heading', { name: mainName, exact: true })
    ).toBeVisible();
    await expect(modal.getByRole('heading', { name: bunName, exact: true })).toHaveCount(
      0
    );
    await expect(
      modal.getByRole('img', { name: 'изображение ингредиента.', exact: true })
    ).toHaveAttribute('src', mainImage);
    for (const [label, value] of [
      ['Калории, ккал', '240'],
      ['Белки, г', '12'],
      ['Жиры, г', '7'],
      ['Углеводы, г', '31'],
    ]) {
      await expect(
        modal.locator('li').filter({ hasText: label }).getByText(value, { exact: true })
      ).toBeVisible();
    }
  });

  test('закрывается по крестику', async ({ page }) => {
    await page.getByRole('dialog').getByRole('button', { name: 'Закрыть' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('закрывается по клику на оверлей', async ({ page }) => {
    await page.getByTestId('modal-overlay').click({ position: { x: 5, y: 5 } });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('закрывается клавишей Escape', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });
});

test.describe('Создание заказа', () => {
  test('отправляет состав, показывает номер заказа, очищает конструктор и закрывает окно', async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([
      { name: 'accessToken', value: encodeURIComponent(accessToken), url: baseURL! },
    ]);
    await page.addInitScript(() =>
      localStorage.setItem('refreshToken', 'fake-refresh-token')
    );
    const userResponse = page.waitForResponse((response) =>
      response.url().endsWith('/api/auth/user')
    );
    await page.goto('/');
    expect((await userResponse).status()).toBe(200);
    await expect(
      page.getByRole('link', { name: 'Тестовый пользователь' })
    ).toBeVisible();
    await addIngredient(page, bunName);
    await addIngredient(page, mainName);
    await addIngredient(page, sauceName);
    await expect(page.getByTestId('constructor-ingredients').locator('li')).toHaveCount(
      2
    );
    const orderRequest = page.waitForRequest(
      (request) => request.url().endsWith('/api/orders') && request.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();
    const request = await orderRequest;
    expect(request.postDataJSON()).toEqual({
      ingredients: ['bun-1', 'main-1', 'sauce-1', 'bun-1'],
    });
    expect(request.headers().authorization).toBe(accessToken);
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('123456', { exact: true })).toBeVisible();
    await expectEmptyConstructor(page);
    await modal.getByRole('button', { name: 'Закрыть' }).click();
    await expect(modal).toHaveCount(0);
    await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
    await expectEmptyConstructor(page);
  });
});
