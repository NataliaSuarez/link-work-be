import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { User } from '../../users/entities/user.entity';
import { Offer } from '../entities/offer.entity';
import { OffersService } from '../services/offers.service';
import { SendgridService } from '../../sendgrid/sendgrid.service';
import { NotifyService } from '../../notify/services/notify.service';

describe('OffersService', () => {
  let service: OffersService;
  const fakeUser: User = {
    id: '1de5b5e9-76c9-4b32-8c52-6ee9757c59d0',
    fcmIdentityToken: null,
    appleIdIdentifier: null,
    googleIdIdentifier: null,
    firstName: 'User',
    lastName: 'Employer',
    email: 'user.employer@getwonder.tech',
    registerType: 0,
    verified: true,
    blocked: false,
    blockedReason: 0,
    failedAttemptsToLogin: 0,
    role: 1,
    profileStatus: 0,
    createAt: new Date('2023-01-18T12:47:51.788Z'),
    updateAt: new Date('2023-02-01T13:08:53.210Z'),
    desactivatedAt: null,
    lastLogin: new Date('2023-02-01T13:08:53.208Z'),
    retrieveToken: null,
    refreshToken: '',
    workerData: null,
    workerShifts: [],
    employerData: null,
    offersOwnedByEmployer: [],
    userImages: [],
    clocksHistory: [],
    address: [],
    supportMsg: [],
    favoriteOffers: [],
    appliedOffers: [],
  };
  const fakeOffer: Offer = {
    id: '05ec0f22-90b4-4200-b85f-ea3e94094820',
    title: 'Operario de limpieza',
    from: new Date('2023-03-30T00:00:00.000Z'),
    to: new Date('2023-03-30T01:00:00.000Z'),
    usdHour: 50,
    usdTotal: 50,
    category: 0,
    videoUrl:
      'https://linkwork-user-media-dev.nyc3.digitaloceanspaces.com/video/offers/employer-1de5b5e9-76c9-4b32-8c52-6ee9757c59d0/offer-05ec0f22-90b4-4200-b85f-ea3e94094820',
    status: 0,
    applicantsCount: 2,
    createAt: new Date('2023-02-01T13:08:53.574Z'),
    updateAt: new Date('2023-02-01T13:08:55.265Z'),
    employerUser: fakeUser,
    shift: null,
    address: null,
    applicants: [fakeUser, fakeUser],
    favoritedBy: [fakeUser, fakeUser],
  };

  const mockSendgridService = createMock<SendgridService>({
    send: () => ({}),
  });
  const mockNotificationService = createMock<NotifyService>({
    sendNotification: () => ({}),
  });

  //   const mockUserRepository = {
  //     create: jest.fn(),
  //     merge: jest.fn(),
  //     save: jest.fn(),
  //     find: jest.fn(),
  //     findOne: jest.fn(),
  //   };
  //   const mockUserImageRepository: jest.Mock = jest.fn();
  //   let mockDOSpacesService: DeepMocked<DOSpacesService>;
  //   let mockConfigService: DeepMocked<ConfigService>;

  //   const fakeCreateUserDto: CreateUserDto = generateCreatingUser(1);
  //   const fakeUser: User = generateNewUser(fakeCreateUserDto);
  //   const fakeUsers: User[] = [
  //     generateNewUser(generateCreatingUser(1)),
  //     generateNewUser(generateCreatingUser(1)),
  //     generateNewUser(generateCreatingUser(2)),
  //   ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        // { provide: getRepositoryToken(User), useValue: mockUserRepository },
        // {
        //   provide: getRepositoryToken(UserImage),
        //   useValue: mockUserImageRepository,
        // },
        // {
        //   provide: DOSpacesService,
        //   useValue: createMock<DOSpacesService>(),
        // },
        // {
        //   provide: ConfigService,
        //   useValue: createMock<ConfigService>(),
        // },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);
    // mockDOSpacesService = module.get(DOSpacesService);
    // mockConfigService = module.get(ConfigService);
  });

  describe('cancel', () => {
    it('should cancel an active offer', async () => {
      const offer = fakeOffer;
      const user = fakeUser;
      const spyOnSendgridService = jest.spyOn(mockSendgridService, 'send');
      const spyOnNotificationService = jest.spyOn(
        mockNotificationService,
        'sendNotification',
      );
      const spyOnRemoveApplicant = jest.spyOn(service, 'removeApplicant');
      const spyOnEditOffer = jest.spyOn(service, 'edit');

      const response = await service.cancel(offer.id, user.id);
      console.log(response);

      expect(spyOnSendgridService).toHaveBeenCalledTimes(offer.applicantsCount);
      expect(spyOnNotificationService).toHaveBeenCalledTimes(
        offer.applicantsCount,
      );
      expect(spyOnRemoveApplicant).toHaveBeenCalledTimes(offer.applicantsCount);
      expect(spyOnEditOffer).toHaveBeenCalledWith(offer, { status: 3 });
    });
  });
});
//   describe('updateUser', () => {
//     it('should return updated user', async () => {
//       const user = fakeUser;
//       const changes = {
//         verified: true,
//       };
//       const modifiedUser = user;
//       modifiedUser.verified = true;
//       const spyOnMerge = jest.spyOn(mockUserRepository, 'merge');
//       const spyOnSave = jest.spyOn(mockUserRepository, 'save');

//       const resp = await service.updateUser(user, changes);

//       expect(spyOnMerge).toBeCalledWith(user, changes);
//       expect(spyOnSave).toBeCalledWith(modifiedUser);
//     });
//   });
