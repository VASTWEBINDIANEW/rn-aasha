// utils/validationSchemas.ts
import * as Yup from 'yup';

export const KYCSchema = Yup.object({
  aadhaar: Yup.string()
    .matches(/^\d{12}$/, 'Enter valid 12-digit Aadhaar')
    .required('Aadhaar is required'),
  pan: Yup.string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Format: ABCDE1234F')
    .required('PAN is required'),
  mobile: Yup.string()
    .matches(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile')
    .required('Mobile is required'),
  email: Yup.string()
    .email('Enter valid email')
    .required('Email is required'),
});

export const BasicInfoSchema = Yup.object({

  fullName: Yup.string()
    .trim()
    .matches(/^[a-zA-Z\s]+$/, 'Only alphabets')
    .min(3, 'Too short')
    .required('Full name required'),

  dob: Yup.string()
    .matches(
      /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/,
      'Format: DD/MM/YYYY or YYYY-MM-DD'
    )
    .required('DOB required'),

  gender: Yup.string()
    .oneOf(['Male', 'Female', 'Other'])
    .required('Select gender'),

  alternateNo: Yup.string()
    .nullable()
    .transform(v => v === '' ? null : v)
    .matches(/^[6-9]\d{9}$/, {
      message: 'Invalid alternate number',
      excludeEmptyString: true,
    }),

  religion: Yup.string()
    .required('Select religion'),

  bloodGroup: Yup.string()
    .required('Select blood group'),

  maritalStatus: Yup.string()
    .oneOf(['Single', 'Married'])
    .required('Select marital status'),

  noOfChildren: Yup.number()
    .transform((v, o) => o === '' ? undefined : v)
    .when('maritalStatus', {
      is: 'Married',
      then: schema =>
        schema
          .typeError('Enter valid number')
          .min(0, 'Invalid')
          .max(10, 'Too many')
          .required('Required'),
      otherwise: schema => schema.notRequired(),
    }),

  fatherName: Yup.string()
    .trim()
    .matches(/^[a-zA-Z\s]+$/, 'onclickhabets')
    .required("Father's name required"),

  fatherOccupation: Yup.string()
    .trim()
    .required("Father's occupation required"),

  // ✅ REQUIRED
  motherName: Yup.string()
    .trim()
    .matches(/^[a-zA-Z\s]+$/, 'Only alphabets')
    .required("Mother's name required"),

  // ✅ REQUIRED
  motherOccupation: Yup.string()
    .trim()
    .required("Mother's occupation required"),

  spouseName: Yup.string()
    .when('maritalStatus', {
      is: 'Married',
      then: schema =>
        schema
          .trim()
          .matches(/^[a-zA-Z\s]+$/, 'Only alphabets')
          .required("Spouse name required"),
      otherwise: schema =>
        schema.nullable().transform(() => null),
    }),

  spouseOccupation: Yup.string()
    .when('maritalStatus', {
      is: 'Married',
      then: schema =>
        schema.required("Spouse occupation required"),
      otherwise: schema =>
        schema.nullable().transform(() => null),
    }),

  // ✅ REQUIRED
  optionalDoc: Yup.string()
    .required('Select document type'),

  optionalDocId: Yup.string()
    .when('optionalDoc', {
      is: (v: string) => !!v,
      then: schema =>
        schema.required('Document number required'),
      otherwise: schema =>
        schema.notRequired(),
    }),
});

export const EducationSchema = Yup.object({
  educations: Yup.array().of(
    Yup.object({
     qualification: Yup.string()
  .test('valid-qual', 'Select qualification', (val) => {
    if (!val) return false;
    return true; // ✅ koi bhi non-empty value allow
  })
  .required('Select qualification'),

      college: Yup.string()
        .min(3, 'College name too short')
        .required('College required'),

      board: Yup.string()
        .min(2, 'Board name too short')
        .required('Board required'),

      fromDate: Yup.string()
        .required('From Date required')
        .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Use format YYYY/MM/DD')
        .test('year-range', 'Year must be between 1960-2035', (val) => {
          if (!val) return false;
          const year = parseInt(val.split('/')[0]);
          return year >= 1960 && year <= 2035;
        }),

      toDate: Yup.string()
        .required('To Date required')
        .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Use format YYYY/MM/DD')
        .test('year-range', 'Year must be between 1960-2035', (val) => {
          if (!val) return false;
          const year = parseInt(val.split('/')[0]);
          return year >= 1960 && year <= 2035;
        })
        .test('toDate-after-fromDate', 'To Date must be after From Date', function (val) {
          // ✅ fromDate se compare karo
          const { fromDate } = this.parent;
          if (!val || !fromDate) return true;
          return val >= fromDate; // YYYY/MM/DD string comparison works correctly
        }),

      percentage: Yup.string()
        .required('Percentage required'),
    })
  )
});




export const DocumentSchema = Yup.object({
  documents: Yup.object({
    aadhaar:        Yup.object({ present: Yup.boolean().nullable().required('Required') }),
    pan:            Yup.object({ present: Yup.boolean().nullable().required('Required') }),
    drivingLicense: Yup.object({ present: Yup.boolean().nullable().required('Required') }),
    other:          Yup.object({ present: Yup.boolean().nullable() }),
  }),
});
const phoneRegex = /^[6-9]\d{9}$/;

const refPerson = Yup.object({
  name: Yup.string().min(2, 'Min 2 chars').required('Required'),
  mobile: Yup.string().matches(phoneRegex, 'Invalid mobile').required('Required'),
});


export const ReferenceSchema = Yup.object({

  // ✅ Neighbour
  neighbour: Yup.object({
    name: Yup.string().required('Neighbour name required'),
  }),

  // ✅ Relative
  relativeRef: Yup.object({
    name: Yup.string().required('Relative name required'),
    relationship: Yup.string().required('Relationship required'),
    pincode: Yup.string()
      .matches(/^\d{6}$/, 'Enter valid 6 digit pincode')
      .required('Pincode required'),
  }),

  // ✅ Emergency
  emergencyContact: Yup.object({
    name: Yup.string().required('Emergency name required'),
    relationship: Yup.string().required('Relationship required'),
  }),

  // ✅ Operational
  operational: Yup.object({
    hasTwoWheeler: Yup.boolean(),

    twoWheelerNumber: Yup.string().when('hasTwoWheeler', {
      is: true,
      then: (s) => s.required('Vehicle number required'),
      otherwise: (s) => s.notRequired(),
    }),
  }),
});

const vehicleNumberRegex = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/i;



// Indian driving license: e.g. MH1220110012345 (15 chars) or DL-0420110176538

const drivingLicenseRegex = /^[A-Z]{2}[- ]?\d{2,4}[- ]?\d{4}[- ]?\d{5,7}$/i;

export const DrivingLicenseSchema = Yup.object({

  isDrivingLicense: Yup.boolean(), // ✅ fix



  drivingLicenseNumber: Yup.string().when('isDrivingLicense', {

    is: true,

    then: s =>

      s

        .required('License number required')

        ,

    otherwise: s => s.notRequired(), // ✅ fix

  }),



  isTwoWheeler: Yup.string()

    .oneOf(['Yes', 'No'], 'Please select Yes or No')

    .required('Please select'),



  twoWheelerNumber: Yup.string().when('isTwoWheeler', {

    is: 'Yes',

    then: s =>

      s

        .required('Two wheeler number required')

        ,

    otherwise: s => s.notRequired(), // ✅ fix

  }),



  // 🔥 MISSING FIELD (MAIN ISSUE)

  
  languageKnown: Yup.string().required('Language required'),

});


// export const DrivingLicenseSchema = Yup.object({
//   isDrivingLicense: Yup.boolean().required(),

//   drivingLicenseNumber: Yup.string().when('isDrivingLicense', {
//     is: true,
//     then: s =>
//       s
//         .required('License number required')
//         .matches(
//           drivingLicenseRegex,
//           'Invalid license number (e.g. MH0420110012345)'
//         ),
//     otherwise: s => s.optional(),
//   }),

//   isTwoWheeler: Yup.string()
//     .oneOf(['Yes', 'No'], 'Please select Yes or No')
//     .required('Please select'),

//   twoWheelerNumber: Yup.string().when('isTwoWheeler', {
//     is: 'Yes',
//     then: s =>
//       s
//         .required('Two wheeler number required')
//         .matches(
//           vehicleNumberRegex,
//           'Invalid format (e.g. MH02AB1234)'
//         ),
//     otherwise: s => s.optional(),
//   }),

//   // vehicleNumber: Yup.string()
//   //   .optional()
//   //   .matches(
//   //     vehicleNumberRegex,
//   //     'Invalid format (e.g. MH02AB1234)'
//   //   ),

//   languageKnown: Yup.string().required('Language required'),
// });