// src/tests/setupMocks.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { DeepMockProxy } from 'jest-mock-extended/lib/Mock';

jest.mock('..', () => ({
  __esModule: true,
  prismaClient: mockDeep<PrismaClient>(),
}));

jest.mock('bcrypt', () => ({
    hashSync: jest.fn((data, salt) => `hashed_${data}`),
    compareSync: jest.fn((data, encrypted) => `hashed_${data}` === encrypted),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn((payload, secret) => `jwt_token_for_${payload.userId}`),
    verify: jest.fn(), // Anda mungkin perlu mock implementasi ini jika ada middleware
}));


beforeEach(() => {
  mockReset(prismaClient);
});

export const prismaClient = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;