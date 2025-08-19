// hooks/useDoctors.ts
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/Store';
import doctorSlots from '../../mockServer/MockData.json';
import doctorSpecialtiesData from '../../mockServer/MockData.json';

export const useDoctors = () => {
  const users = useSelector((state: RootState) => state.user.users);
  //const doctorSlots = useSelector((state: RootState) => state.doctors.doctorSlots);
  const specialties = useSelector((state: RootState) => state.doctors.specialties);

  return useMemo(() => {
    return users
      .filter((user: any) => user.roleId === 2)
      .map((user: any) => {
        const slotObj = doctorSlots.DoctorsSlots.find((s: any) => String(s.doctorId) === String(user.id));
        //const specialty = specialties.find((spec: any) => spec.id === user.specialtyId);
        const specialty = doctorSpecialtiesData.DoctorSpecialties.find((spec: any) => spec.id === user.specialtyId);

        return {
          label: user.name,
          value: String(user.id),
          availableSlots: slotObj ? slotObj.slots : [],
          specialtyId: user.specialtyId,
          specialtyName: specialty?.name || 'General Medicine',
        };
      });
  }, [users, doctorSlots, specialties]);
};
