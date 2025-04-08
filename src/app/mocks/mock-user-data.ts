import { IUser } from '../model/user';

export const LOGIN_DATA: { password: string; email: string; token: string }[] = [
  {
    email: 'a@a.com',
    password: 'alma11',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkxpYSBEb2UiLCJpYXQiOjE1MTYyMzkwMjIsIm5hbWVJZCI6IjEifQ.X64kTqTCgs_wrI4hqU974-oK2VuRIZMzrHt7vpZxW80',
  },
  {
    email: 'john@smith.com',
    password: 'alma11',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gU21pdGgiLCJpYXQiOjE1MTYyMzkwMjIsIm5hbWVJZCI6IjIifQ.aumSCOyFQWAhhf7bCTRF_mqmFRaKWovqgSZaBQVTAMk',
  },
];

export const MOCK_USERDATA: IUser[] = [
  {
    userId: '1',
    name: 'Lia Doe',
    username: 'liadoe',
    email: 'a@a.com',
    password: 'alma',
    description: 'I am a chef and I love to cook',
    profilePictureUrl: '../../../../assets/images/users/kiss-anna.jpg',
    receipts: {
      saved: [1, 2],
      liked: [1, 2, 3, 4, 9, 7, 6],
      created: [1, 2, 7],
      collections: [
        {
          id: 0,
          name: 'Reggelik',
          receipts: [1],
        },
        {
          id: 1,
          name: 'Vacsorák',
          receipts: [2],
        },
        {
          id: 2,
          name: 'Kedvenc',
          receipts: [4],
        },
      ],
    },
  },
  {
    userId: '2',
    name: 'John Smith',
    username: 'johnsmith',
    email: 'john@smith.com',
    password: 'alma',
    description: 'Food lover and home chef',
    profilePictureUrl: '../../../../assets/images/users/john-smith.jpg',
    receipts: {
      saved: [3, 4, 5],
      liked: [2, 5, 4],
      created: [3, 5, 6],
      collections: [
        {
          id: 0,
          name: 'Reggelik',
          receipts: [4, 5, 6],
        },
      ],
    },
  },
  {
    userId: '3',
    name: 'Emma Brown',
    username: 'emmabrown',
    email: 'emma@brown.com',
    password: 'alma',
    description: 'Baking enthusiast',
    profilePictureUrl: '../../../../assets/images/users/emma-brown.jpg',

    receipts: {
      saved: [6, 7, 8, 9],
      liked: [1, 3, 5, 7, 9],
      created: [8, 9],
      collections: [
        {
          id: 0,
          name: 'Reggelik',
          receipts: [4, 5, 6],
        },
      ],
    },
  },
];
