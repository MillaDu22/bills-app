/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";

describe('Given I am connected as an employee', () => {
  describe("When I am on NewBill page, there are a mail icon in vertical layout", () => {
    test("Then, the icon should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const windowIcon = screen.getByTestId('icon-mail');
      const isIconActivated = windowIcon.classList.contains('active-icon');
      expect(isIconActivated).toBeTruthy();
    });
  });
  describe("Then I am on NewBill page, there are a form", () => {
    test("Then, all the form input should be render correctly", () => {
      document.body.innerHTML = NewBillUI();
      const formNewBill = screen.getByTestId('form-new-bill');
      const type = screen.getAllByTestId('expense-type');
      const name = screen.getAllByTestId('expense-name');
      const date = screen.getAllByTestId('datepicker');
      const amount = screen.getAllByTestId('amount');
      const vat = screen.getAllByTestId('vat');
      const pct = screen.getAllByTestId('pct');
      const commentary = screen.getAllByTestId('commentary');
      const file = screen.getAllByTestId('file');
      const submitBtn = document.querySelector('#btn-send-bill');

      expect(formNewBill).toBeTruthy();
      expect(type).toBeTruthy();
      expect(name).toBeTruthy();
      expect(date).toBeTruthy();
      expect(amount).toBeTruthy();
      expect(vat).toBeTruthy();
      expect(pct).toBeTruthy();
      expect(commentary).toBeTruthy();
      expect(file).toBeTruthy();
      expect(submitBtn).toBeTruthy();
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
    });
  });
  describe('When I am on NewBill page, and a user uploads an accepted format file', () => {
    test('Then the file name should be correctly displayed in the input, allowedExtension should be true, and no error message should be displayed', () => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({})),
      };
      const newBill = new NewBill({ document, onNavigate, store, localStorage });
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const file = screen.getByTestId('file');
      window.alert = jest.fn();
      file.addEventListener('change', handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(['file.png'], 'file.png', { type: 'image/png' })],
        },
      });
      // Je m'assure que handleChangeFile a été appelé //
      expect(handleChangeFile).toHaveBeenCalled();
      // Je m'aasure que allowedExtension est true //
      expect(newBill.allowedExtension).toBe(true);
      // Je m'assure que le message d'erreur n'a pas été affiché //
      expect(window.alert).not.toHaveBeenCalled();
      expect(document.getElementById('file-error-message').textContent).toBe('');
    });
  });
  describe("When I am on NewBill page, and a user uploads an unaccepted format file", () => {
    test("Then, the file name should not be displayed in the input, allowedExtension should be false, and an error message should be displayed", () => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const newBill = new NewBill({ document, onNavigate, store, localStorage });
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const file = screen.getByTestId('file');
      window.alert = jest.fn();
      file.addEventListener('change', handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
        },
      });
       // Je m'assure que handleChangeFile a été appelé //
      expect(handleChangeFile).toHaveBeenCalled();
      // Je m'aasure que allowedExtension est false //
      expect(newBill.allowedExtension).toBe(false);
      // Je m'assure que le message d'erreur est affiché //
      expect(document.getElementById('file-error-message').textContent).toBe("Veuillez charger un fichier au format jpg, jpeg ou png");
    });
  });
});

// Test POST //
describe('When I navigate to Dashboard employee', () => {
  describe('Given I am a user connected as Employee, and a user post a newBill', () => {
    test('Add a bill from mock API POST', async () => {
      const postSpy = jest.spyOn(mockStore, 'bills');
      const bill = {
        id: '47qAXb6fIm2zOKkLzMro',
        vat: '80',
        fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: 'pending',
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: 'encore',
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: '2004-04-04',
        amount: 400,
        commentAdmin: 'ok',
        email: "a@a",
        pct: 20,
      };
      const postBills = await mockStore.bills().update(bill);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postBills).toStrictEqual(bill);
    });
    describe('When an error occurs on API', () => {
      beforeEach(() => {
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
          })
        );
        document.body.innerHTML = NewBillUI();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
      });
      test('Add bills from an API and fails with 404 message error', async () => {
        const postSpy = jest.spyOn(console, 'error');
        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error('404'))),
        };
        const newBill = new NewBill({ document, onNavigate, store, localStorage });
        newBill.isImgFormatValid = true;
        // Submit form //
        const form = screen.getByTestId('form-new-bill');
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener('submit', handleSubmit);

        fireEvent.submit(form);
        await new Promise(process.nextTick);
        expect(postSpy).toBeCalledWith(new Error('404'));
      });
      test('Add bills from an API and fails with 500 message error', async () => {
        const postSpy = jest.spyOn(console, 'error');
        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error('500'))),
        };
        const newBill = new NewBill({ document, onNavigate, store, localStorage });
        newBill.isImgFormatValid = true;
        // Submit form //
        const form = screen.getByTestId('form-new-bill');
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener('submit', handleSubmit);
        fireEvent.submit(form);
        await new Promise(process.nextTick);
        expect(postSpy).toBeCalledWith(new Error('500'));
      });
    });
  });
});
