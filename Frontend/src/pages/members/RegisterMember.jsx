import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Camera, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { FormField, TextInput, SelectInput } from '../../components/forms/FormField';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { fetchMembers } from '../../redux/slices/membersSlice';
import axios from 'axios';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  nationalId: yup.string().required('National ID is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  gender: yup.string().oneOf(['male', 'female', 'other']).required('Gender is required'),
  address: yup.string().required('Address is required'),
  occupation: yup.string(),
  employer: yup.string(),
  nextOfKinName: yup.string().required('Next of kin name is required'),
  nextOfKinPhone: yup.string().required('Next of kin phone is required'),
  nextOfKinRelationship: yup.string().required('Relationship is required'),
  nextOfKinAddress: yup.string(),
  beneficiaryName: yup.string(),
  beneficiaryPhone: yup.string(),
  beneficiaryRelationship: yup.string(),
});

const RegisterMember = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  console.log('Logged in user:', user);
  console.log('Form errors:', errors);
  console.log('isSubmitting:', isSubmitting);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Photo must be less than 2MB');
        return;
      }
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(null);
  };

  const onSubmit = async (data) => {
    console.log('🔥 onSubmit called!', data);
    alert('Form submitted! Check console.');
    
    let loadingToast;
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('You must be logged in to register a member');
        return;
      }
      
      console.log('Starting member registration...', data);
      loadingToast = toast.loading('Registering member...');
      
      // Get branch ID from logged in user or use a default
      const branchId = user?.branchId || user?.branch?.id;
      
      if (!branchId) {
        toast.error('Branch information missing. Please contact administrator.', {
          id: loadingToast
        });
        return;
      }
      
      console.log('Using branchId:', branchId);
      
      const memberRes = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/members`,
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || null,
          phone: data.phone,
          nationalId: data.nationalId,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          occupation: data.occupation || null,
          employer: data.employer || null,
          branchId: branchId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Member created:', memberRes.data);
      const memberId = memberRes.data.data.id;
      const memberNumber = memberRes.data.data.memberNumber;

      if (profilePhoto) {
        toast.loading('Uploading profile photo...', { id: loadingToast });
        const formData = new FormData();
        formData.append('document', profilePhoto);
        formData.append('documentType', 'profile_photo');
        
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/members/${memberId}/documents`,
            formData,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              } 
            }
          );
        } catch (photoError) {
          console.error('Photo upload failed:', photoError);
        }
      }

      toast.loading('Adding next of kin...', { id: loadingToast });
      try {
        // Split the name into firstName and lastName for backend
        const kinNames = data.nextOfKinName.trim().split(' ');
        const kinFirstName = kinNames[0] || data.nextOfKinName;
        const kinLastName = kinNames.slice(1).join(' ') || kinNames[0];
        
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/members/${memberId}/next-of-kin`,
          {
            firstName: kinFirstName,
            lastName: kinLastName,
            phone: data.nextOfKinPhone,
            relationship: data.nextOfKinRelationship,
            address: data.nextOfKinAddress || null,
            isPrimary: true,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (kinError) {
        console.error('Next of kin failed:', kinError);
        console.error('Next of kin error response:', kinError.response?.data);
      }

      if (data.beneficiaryName) {
        toast.loading('Adding beneficiary...', { id: loadingToast });
        try {
          // Split the name into firstName and lastName for backend
          const benefNames = data.beneficiaryName.trim().split(' ');
          const benefFirstName = benefNames[0] || data.beneficiaryName;
          const benefLastName = benefNames.slice(1).join(' ') || benefNames[0];
          
          await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/members/${memberId}/next-of-kin`,
            {
              firstName: benefFirstName,
              lastName: benefLastName,
              phone: data.beneficiaryPhone,
              relationship: data.beneficiaryRelationship,
              isPrimary: false,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (benefError) {
          console.error('Beneficiary failed:', benefError);
          console.error('Beneficiary error response:', benefError.response?.data);
        }
      }

      toast.success(`Member ${memberNumber} registered successfully! Login credentials have been sent to ${data.email}`, { 
        id: loadingToast,
        duration: 5000,
        icon: '✅'
      });
      
      dispatch(fetchMembers());
      
      // Navigate immediately
      navigate('/members');
      
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.response?.data?.message);
      console.error('Error details:', error.response?.data?.errors);
      
      if (loadingToast) {
        toast.error(error.response?.data?.message || 'Failed to register member', {
          id: loadingToast
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to register member');
      }
    }
  };

  return (
    <div>
      <PageHeader title="Register Member" subtitle="Add a new member to the SACCO" />
      
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">Profile Photo</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                {photoPreview ? (
                  <div className="relative">
                    <img 
                      src={photoPreview} 
                      alt="Profile preview" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-ink-100 dark:bg-ink-700 flex items-center justify-center">
                    <Camera size={22} className="text-ink-400" />
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label htmlFor="photo-upload">
                  <Button type="button" variant="outline" onClick={() => document.getElementById('photo-upload').click()}>
                    Upload Photo
                  </Button>
                </label>
                <p className="text-xs text-ink-400 mt-1.5">JPG or PNG, max 2MB</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="First name" error={errors.firstName} required>
                <TextInput register={register} name="firstName" placeholder="e.g. Mary" error={errors.firstName} />
              </FormField>
              <FormField label="Last name" error={errors.lastName} required>
                <TextInput register={register} name="lastName" placeholder="e.g. Wanjiru" error={errors.lastName} />
              </FormField>
              <FormField label="Email address" error={errors.email} required>
                <TextInput register={register} name="email" type="email" placeholder="member@email.com" error={errors.email} />
              </FormField>
              <FormField label="Phone number" error={errors.phone} required>
                <TextInput register={register} name="phone" placeholder="+254 7XX XXX XXX" error={errors.phone} />
              </FormField>
              <FormField label="National ID number" error={errors.nationalId} required>
                <TextInput register={register} name="nationalId" placeholder="e.g. 30123456" error={errors.nationalId} />
              </FormField>
              <FormField label="Date of Birth" error={errors.dateOfBirth} required>
                <TextInput register={register} name="dateOfBirth" type="date" error={errors.dateOfBirth} />
              </FormField>
              <FormField label="Gender" error={errors.gender} required>
                <SelectInput register={register} name="gender" error={errors.gender}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </SelectInput>
              </FormField>
              <FormField label="Occupation" error={errors.occupation}>
                <SelectInput register={register} name="occupation" error={errors.occupation}>
                  <option value="">Select occupation</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Lawyer">Lawyer</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Driver">Driver</option>
                  <option value="Government Employee">Government Employee</option>
                  <option value="Private Sector Employee">Private Sector Employee</option>
                  <option value="Self Employed">Self Employed</option>
                  <option value="Student">Student</option>
                  <option value="Retired">Retired</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Other">Other</option>
                </SelectInput>
              </FormField>
              <FormField label="Employer" error={errors.employer}>
                <TextInput register={register} name="employer" placeholder="e.g. Company Name" error={errors.employer} />
              </FormField>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">Address</h3>
            <FormField label="Physical address" error={errors.address} required>
              <textarea
                {...register('address')}
                rows="3"
                placeholder="Enter physical address (e.g., P.O. Box 1234, Nairobi or House No. 123, Street Name, City)"
                className="w-full bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-600 rounded-lg px-3 py-2 text-sm text-ink-800 dark:text-ink-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.address && <p className="text-xs text-danger mt-1">{errors.address.message}</p>}
            </FormField>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">Next of Kin</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Name" error={errors.nextOfKinName} required>
                <TextInput register={register} name="nextOfKinName" placeholder="Full name" error={errors.nextOfKinName} />
              </FormField>
              <FormField label="Phone" error={errors.nextOfKinPhone} required>
                <TextInput register={register} name="nextOfKinPhone" placeholder="+254 7XX XXX XXX" error={errors.nextOfKinPhone} />
              </FormField>
              <FormField label="Relationship" error={errors.nextOfKinRelationship} required>
                <SelectInput register={register} name="nextOfKinRelationship" error={errors.nextOfKinRelationship}>
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="child">Child</option>
                  <option value="other">Other</option>
                </SelectInput>
              </FormField>
              <FormField label="Address" error={errors.nextOfKinAddress}>
                <TextInput register={register} name="nextOfKinAddress" placeholder="Address" error={errors.nextOfKinAddress} />
              </FormField>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">Beneficiary (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Name" error={errors.beneficiaryName}>
                <TextInput register={register} name="beneficiaryName" placeholder="Full name" error={errors.beneficiaryName} />
              </FormField>
              <FormField label="Phone" error={errors.beneficiaryPhone}>
                <TextInput register={register} name="beneficiaryPhone" placeholder="+254 7XX XXX XXX" error={errors.beneficiaryPhone} />
              </FormField>
              <FormField label="Relationship" error={errors.beneficiaryRelationship}>
                <SelectInput register={register} name="beneficiaryRelationship" error={errors.beneficiaryRelationship}>
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="child">Child</option>
                  <option value="other">Other</option>
                </SelectInput>
              </FormField>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-ink-100 dark:border-ink-700">
            <Button 
              type="submit" 
              loading={isSubmitting}
              onClick={() => console.log('🔘 Button clicked!')}
            >
              {isSubmitting ? 'Registering...' : 'Register Member'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/members')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterMember;
