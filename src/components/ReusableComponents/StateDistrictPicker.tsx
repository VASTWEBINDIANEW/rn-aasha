import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SelectPicker } from '../../features/RadiantApp/components/FormUI';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';

interface Props {
  stateValue: string;
  districtValue: string;

  initialStateId?: number | string | null;
  initialDistrictId?: number | string | null;

  onStateChange: (name: string, id: number | null) => void;
  onDistrictChange: (name: string, id: number | null) => void;
}

const StateDistrictPicker = ({
  stateValue,
  districtValue,
  initialStateId,
  initialDistrictId,
  onStateChange,
  onDistrictChange,
}: Props) => {
  const { get } = useAxiosHook();

  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);

  // 🔁 Helper — handles all API key variations
  const getStateId = (s: any) =>
    s['Sate Id'] ?? s['State Id'] ?? s['stateId'] ?? s['StateId'] ?? s['id'];

  const getDistrictId = (d: any) =>
    d['Dist Id'] ?? d['District Id'] ?? d['districtId'] ?? d['DistrictId'] ?? d['id'];

  // ✅ Fetch States — ab APP_URLS + app ke standard axios hook se
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const data = await get({ url: APP_URLS.statelist });

        console.log('✅ STATE LIST (first item keys):', data?.[0] ? Object.keys(data[0]) : 'EMPTY');
        console.log('✅ STATE LIST (first item):', JSON.stringify(data?.[0]));
        setStates(data || []);
      } catch (err) {
        console.log('❌ STATE ERROR:', err);
      }
    };

    fetchStates();
  }, []);

  // ✅ Prefill STATE (ID → NAME)
  useEffect(() => {
    if (!states.length) {
      console.log('⏳ Waiting for states list to load...');
      return;
    }
    if (initialStateId === null || initialStateId === undefined) {
      console.log('ℹ️ No initialStateId passed — skipping state prefill');
      return;
    }

    console.log('🔁 Prefill State ID (raw):', initialStateId, typeof initialStateId);

    // ✅ Number() coercion — handles "8" vs 8 vs "8.0" type mismatches
    const selected = states.find(s => {
      const sid = getStateId(s);
      return Number(sid) === Number(initialStateId) || String(sid) === String(initialStateId);
    });

    console.log('🎯 Matched State:', selected ? JSON.stringify(selected) : 'NO MATCH FOUND');

    if (selected) {
      const id = getStateId(selected);
      console.log('✅ Setting state name:', selected['State Name'], 'id:', id);
      onStateChange(selected['State Name'], Number(id));
      setSelectedStateId(Number(id));
    } else {
      console.log('❌ No state matched! Check field name mismatch — see STATE LIST keys logged above.');
    }
  }, [states, initialStateId]);

  // ✅ Fetch Districts — ab APP_URLS + app ke standard axios hook se
  useEffect(() => {
    if (!selectedStateId) return;

    const fetchDistricts = async () => {
      try {
        const data = await get({
          url: `${APP_URLS.getDistricts}${selectedStateId}`,
        });

        console.log('✅ DISTRICT LIST (first item keys):', data?.[0] ? Object.keys(data[0]) : 'EMPTY');
        console.log('✅ DISTRICT LIST (first item):', JSON.stringify(data?.[0]));
        setDistricts(data || []);
      } catch (err) {
        console.log('❌ DISTRICT ERROR:', err);
      }
    };

    fetchDistricts();
  }, [selectedStateId]);

  // ✅ Prefill DISTRICT (only fires if initialDistrictId is explicitly passed)
  useEffect(() => {
    if (!districts.length) return;
    if (initialDistrictId === null || initialDistrictId === undefined) return;

    console.log('🔁 Prefill District ID (raw):', initialDistrictId, typeof initialDistrictId);

    const selected = districts.find(d => {
      const did = getDistrictId(d);
      return Number(did) === Number(initialDistrictId) || String(did) === String(initialDistrictId);
    });

    console.log('🎯 Matched District:', selected ? JSON.stringify(selected) : 'NO MATCH FOUND');

    if (selected) {
      onDistrictChange(selected['Dist Name'], Number(getDistrictId(selected)));
    } else {
      console.log('❌ No district matched! Check field name mismatch — see DISTRICT LIST keys logged above.');
    }
  }, [districts, initialDistrictId]);

  return (
    <View>
      {/* STATE */}
      <SelectPicker
        label="State"
        value={stateValue}
        options={states.map(s => s['State Name'])}
        onChange={(val: string) => {
          const selected = states.find(s => s['State Name'] === val);
          const id = selected ? getStateId(selected) : null;

          console.log('🟢 Selected State:', val, id);

          onStateChange(val, id !== null ? Number(id) : null);
          setSelectedStateId(id !== null ? Number(id) : null);

          // reset district
          onDistrictChange('', null);
          setDistricts([]);
        }}
      />

      {/* DISTRICT */}
      <SelectPicker
        label="District"
        value={districtValue}
        options={districts.map(d => d['Dist Name'])}
        onChange={(val: string) => {
          const selected = districts.find(d => d['Dist Name'] === val);
          const id = selected ? getDistrictId(selected) : null;

          console.log('🟢 Selected District:', val, id);

          onDistrictChange(val, id !== null ? Number(id) : null);
        }}
      />
    </View>
  );
};

export default StateDistrictPicker;