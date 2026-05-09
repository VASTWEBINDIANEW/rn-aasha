import { View, Text, useColorScheme } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../reduxUtils/store'
import { useNavigation } from '@react-navigation/native'
import useAxiosHook from '../../utils/network/AxiosClient'
import { APP_URLS } from '../../utils/network/urls'
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond'
import DateRangePicker from '../../components/DateRange'

export default function DayBook2() {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo)
  const color1 = `${colorConfig.secondaryColor}20`
const [loading,setIsLoading]= useState(true)
  const [inforeport, setInforeport] = useState([]);
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();
  const { get, post } = useAxiosHook();
  const colorScheme = useColorScheme();
  const [days, setDays] = useState([])
  const [selectedDate, setSelectedDate] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  useEffect(() => {
    DayE(selectedDate.from, selectedDate.to);
  }, [DayE]);
const DayE=async (f,t)=>{
         const formattedFrom = new Date(f).toISOString().split('T')[0];
      const formattedTo = new Date(t).toISOString().split('T')[0];
    try {
            setIsLoading(true)

            const url = `${APP_URLS.daybook}from=${formattedFrom}&to=${formattedTo}`;
            const res = await get({url:url});
            console.log(res);
            console.log(url,res);
    } catch (error) {
        
    }finally{
        setIsLoading(false)
    }
}
 
  return (
    <View>
<AppBarSecond title={'Day Book'}/>

        <DateRangePicker

          onDateSelected={(from, to) => setSelectedDate({ from, to })}

          SearchPress={(from, to, status) => DayE(from, to)}

          status={selectedStatus}

          setStatus={setSelectedStatus}

          isStShow={false}

          isshowRetailer={false}
          retailerID={(id) => { console.log(id) }}
        />

    </View>
  )
}
