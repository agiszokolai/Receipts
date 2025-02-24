import { User } from '../model/user';

export const LOGIN_DATA: { password: string; email: string; token: string }[] =
  [
    {
      email: 'a@a.com',
      password: 'alma',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkxpYSBEb2UiLCJpYXQiOjE1MTYyMzkwMjIsIm5hbWVJZCI6IjEifQ.X64kTqTCgs_wrI4hqU974-oK2VuRIZMzrHt7vpZxW80',
    },
  ];

export const MOCK_USERDATA: User[] = [
  {
    userId: '1',
    name: 'Lia Doe',
    username: 'liadoe',
    email: 'a@a.com',
    password: 'alma',
    description: 'I am a chef and I love to cook',
    profilePictureUrl: '../../../../assets/images/users/kiss-anna.jpg',
    /* saved: 2, */
    savedReceipts: [1, 2],
    savedCollections: [
      {
        id: 'breakfasts',
        name: 'Reggelik',
        receipts: [4, 5, 6],
      },
      {
        id: 'dinners',
        name: 'Vacsorák',
        receipts: [7, 8, 9],
      },
    ],
    /* liked: 4, */
    likedReceipts: [1, 2, 3, 4, 9, 7, 6],
    /* loggedIn: true, */
    /* created: 10, */
    /* likes: 300, */
    createdReceiptsId: [1, 2, 7],
  },
  {
    userId: '2',
    name: 'John Smith',
    username: 'johnsmith',
    email: 'john@smith.com',
    password: 'alma',
    description: 'Food lover and home chef',
    profilePictureUrl: '../../../../assets/images/users/john-smith.jpg',
    /*  saved: 5, */
    savedReceipts: [3, 4, 5],
    /* liked: 3, */
    likedReceipts: [2, 4, 5],
    /*  loggedIn: false, */
    createdReceiptsId: [3, 5, 6],
  },
  {
    userId: '3',
    name: 'Emma Brown',
    username: 'emmabrown',
    email: 'emma@brown.com',
    password: 'alma',
    description: 'Baking enthusiast',
    profilePictureUrl: '../../../../assets/images/users/emma-brown.jpg',
    /* saved: 7, */
    savedReceipts: [6, 7, 8, 9],
    /*  liked: 6, */
    likedReceipts: [1, 3, 5, 7, 9],
    /*   loggedIn: false, */
  },
];
