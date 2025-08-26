// Redux slice for managing medical data (consultations, medical history)
import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { Consultation, ExtendedPatient, MedicalHistoryEntry } from '../../types/medical';
import patientData from '../../../mockServer/MockData.json';
import consultationData from '../../../mockServer/MockData.json';

const API_URL = 'http://localhost:8000/consultations'; // Your REST API endpoint

interface MedicalState {
  consultations: Consultation[];
  //extendedPatients: ExtendedPatient[];
  loading: boolean;
  error: string | null;
}

// Async GET request
export const fetchConsultations = createAsyncThunk('consultations/fetchConsultations', async () => {
  const res = await fetch(API_URL);
  return await res.json();
  /* code from appointment slice after i implemented the fast endpoints
  const data = await res.json();
  return Array.isArray(data) ? data : (data.appointments ?? data.Appointments ?? []);
  */
});

// Async POST request
export const addConsultationAsync = createAsyncThunk(
  'consultations/addConsultationAsync',
  async (newConsultation: Consultation) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConsultation),
    });
    return await res.json();
  }
);

// userSlice.ts
export const updateConsultationAsync = createAsyncThunk(
  'consultations/updateConsultation',
  async (consultation: Consultation) => {
    const response = await fetch(`${API_URL}/${consultation.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consultation),
    });

    if (!response.ok) {
      throw new Error('Failed to update consultation');
    }

    return await response.json();
  }
);

export const deleteConsultationAsync = createAsyncThunk(
  'consultations/deleteConsultation',
  async (consultationId: string) => {
    const response = await fetch(`${API_URL}/${consultationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete consultation');
    }

    return await response.json();
  }
);


// Calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Initial state with medical data loaded from JSON
const initialState: MedicalState = {
  consultations: (consultationData.Consultations || []) as Consultation[],
  // extendedPatients: patientData.Patients.map((patient: any) => ({
  //   ...patient,
  //   age: calculateAge(patient.dateOfBirth)
  // })) as ExtendedPatient[],
  loading: false,
  error: null,
};

// Create medical slice with reducers for medical data management
const medicalSlice = createSlice({
  name: 'medical',
  initialState,
  reducers: {
    // Add a new consultation record
    addConsultation: (state, action: PayloadAction<Consultation>) => {
      state.consultations.push(action.payload);
      
      // Also add to patient's medical history
      //const patient = state.extendedPatients.find(p => p.id === action.payload.patientId);
      // if (patient) {
      //   const historyEntry: MedicalHistoryEntry = {
      //     id: `mh_${Date.now()}`,
      //     date: action.payload.date,
      //     type: 'consultation',
      //     doctorId: action.payload.doctorId,
      //     doctorName: action.payload.doctorName,
      //     title: action.payload.diagnosis,
      //     description: action.payload.notes,
      //     symptoms: action.payload.symptoms,
      //   };
      //   patient.medicalHistory.push(historyEntry);
        
      //   // Add prescriptions to medical history
      //   action.payload.prescriptions.forEach(prescription => {
      //     const prescriptionEntry: MedicalHistoryEntry = {
      //       id: `mh_${Date.now()}_${prescription.id}`,
      //       date: action.payload.date,
      //       type: 'prescription',
      //       doctorId: action.payload.doctorId,
      //       doctorName: action.payload.doctorName,
      //       title: prescription.medication,
      //       description: prescription.instructions || '',
      //       dosage: `${prescription.dosage} ${prescription.frequency}`,
      //     };
      //     patient.medicalHistory.push(prescriptionEntry);
      //   });
      // }
    },
    
    // Update an existing consultation
    updateConsultation: (state, action: PayloadAction<Consultation>) => {
      const index = state.consultations.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.consultations[index] = action.payload;
      }
    },
    
    // Add medical history entry to a patient
    // addMedicalHistoryEntry: (state, action: PayloadAction<{
    //   patientId: string;
    //   entry: MedicalHistoryEntry;
    // }>) => {
    //   const patient = state.extendedPatients.find(p => p.id === action.payload.patientId);
    //   if (patient) {
    //     patient.medicalHistory.push(action.payload.entry);
    //   }
    // },
    
    // Update patient medical information (allergies, blood type, etc.)
    // updatePatientMedicalInfo: (state, action: PayloadAction<{
    //   patientId: string;
    //   allergies?: string[];
    //   bloodType?: string;
    // }>) => {
    //   const patient = state.extendedPatients.find(p => p.id === action.payload.patientId);
    //   if (patient) {
    //     if (action.payload.allergies) {
    //       patient.allergies = action.payload.allergies;
    //     }
    //     if (action.payload.bloodType) {
    //       patient.bloodType = action.payload.bloodType;
    //     }
    //   }
    // },
    
    // Get consultations by doctor ID
    getConsultationsByDoctor: (state, action: PayloadAction<string>) => {
      // This is handled by selectors, but we can add filtering logic here if needed
    },
    
    // Get consultations by patient ID
    getConsultationsByPatient: (state, action: PayloadAction<string>) => {
      // This is handled by selectors, but we can add filtering logic here if needed
    },
    
    // Set loading state for async operations
    setMedicalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error message for medical operations
    setMedicalError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addConsultationAsync.fulfilled, (state, action: PayloadAction<Consultation>) => {
        const consultation = action.payload;
        state.consultations.push(consultation);

        // const patient = state.extendedPatients.find(p => p.id === consultation.patientId);
        // if (patient) {
        //   // Add consultation entry to medical history
        //   const historyEntry: MedicalHistoryEntry = {
        //     id: `mh_${Date.now()}`,
        //     date: consultation.date,
        //     type: 'consultation',
        //     doctorId: consultation.doctorId,
        //     doctorName: consultation.doctorName,
        //     title: consultation.diagnosis,
        //     description: consultation.notes,
        //     symptoms: consultation.symptoms,
        //   };
        //   patient.medicalHistory.push(historyEntry);

        //   // Add each prescription to medical history
        //   consultation.prescriptions.forEach(prescription => {
        //     const prescriptionEntry: MedicalHistoryEntry = {
        //       id: `mh_${Date.now()}_${prescription.id}`,
        //       date: consultation.date,
        //       type: 'prescription',
        //       doctorId: consultation.doctorId,
        //       doctorName: consultation.doctorName,
        //       title: prescription.medication,
        //       description: prescription.instructions || '',
        //       dosage: `${prescription.dosage} ${prescription.frequency}`,
        //     };
        //     patient.medicalHistory.push(prescriptionEntry);
        //   });
        // }
      })

      .addCase(updateConsultationAsync.fulfilled, (state, action: PayloadAction<Consultation>) => {
        const updated = action.payload;
        const index = state.consultations.findIndex(c => c.id === updated.id);
        if (index !== -1) {
          state.consultations[index] = updated;
        }

        // Optionally: update the medical history if consultation changes
        // Not required unless you're showing/editing past notes/diagnosis
      })

      .addCase(fetchConsultations.fulfilled, (state, action: PayloadAction<Consultation[]>) => {
        state.consultations = action.payload;
      })

      .addCase(deleteConsultationAsync.fulfilled, (state, action: PayloadAction<Consultation>) => {
        state.consultations = state.consultations.filter(c => c.id !== action.payload.id);
      });
  }
});

// Export actions for use in components
export const {
  addConsultation,
  updateConsultation,
  // addMedicalHistoryEntry,
  // updatePatientMedicalInfo,
  getConsultationsByDoctor,
  getConsultationsByPatient,
  setMedicalLoading,
  setMedicalError,
} = medicalSlice.actions;

// Export reducer for store configuration
export default medicalSlice.reducer;