import React from 'react';
import { ActivityIndicator } from 'react-native';

interface Props {
  size?: 'small' | 'large' | number; // string or number
  color?: string;
}

const ShowLoaderBtn: React.FC<Props> = ({
  size = "small",
  color = "#fff",
}) => {
  return (
    <ActivityIndicator size={size} color={color} />
  );
};

export default ShowLoaderBtn;
