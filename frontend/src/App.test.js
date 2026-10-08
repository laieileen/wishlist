import { act, fireEvent, render, screen } from '@testing-library/react';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import App from './App';

jest.mock('firebase/app', () => ({ initializeApp: jest.fn(() => ({})) }));
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getFirestore: jest.fn(() => ({})),
  onSnapshot: jest.fn(() => jest.fn()),
}));

test('sends a password recovery email from the signed-out screen', async () => {
  let authStateCallback;
  onAuthStateChanged.mockImplementation((_auth, callback) => {
    authStateCallback = callback;
    return jest.fn();
  });

  render(<App />);
  act(() => authStateCallback(null));

  expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
  expect(screen.getByRole('heading', { name: /reset your password/i })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'eileen@example.com' } });
  sendPasswordResetEmail.mockResolvedValueOnce();
  fireEvent.click(screen.getByRole('button', { name: /send reset email/i }));

  expect(await screen.findByText(/password reset email sent/i)).toBeInTheDocument();
  expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'eileen@example.com');
});
