import { faker } from '@faker-js/faker';

import { RegisterType } from '../../users/entities/user.entity';

export function generateCreatingUser() {
  const password = faker.internet.password();
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: password,
    repeatPassword: password,
    role: 1,
    registerType: RegisterType.EMAIL_AND_PASSWORD,
  };
}

export function generateNewUser(userData) {
  return {
    id: faker.datatype.uuid(),
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    registerType: userData.registerType,
    verified: false,
    blocked: false,
    blockedReason: 0,
    failedAttemptsToLogin: 0,
    role: userData.role,
    profileStatus: 0,
    createAt: new Date(),
    updateAt: new Date(),
    desactivatedAt: null,
    retrieveToken: null,
    userImages: [],
    employerData: null,
    address: [],
    appleIdIdentifier: '',
    googleIdIdentifier: '',
    refreshToken: '',
    workerData: null,
    workerShifts: [],
    offersOwnedByEmployer: [],
    clocksHistory: [],
    supportMsg: [],
    favoriteOffers: [],
    appliedOffers: [],
  };
}
