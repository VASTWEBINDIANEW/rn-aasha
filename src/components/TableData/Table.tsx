import React from 'react';
import { View, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import { hScale, wScale } from '../../utils/styles/dimensions';

interface TableRowData {
  label1: string;
  value1: any;
  label2?: string;
  value2?: any;
  valueStyle1?: TextStyle;
  valueStyle2?: TextStyle;
}

interface TableProps {
  data: TableRowData[];
  tableStyle?: ViewStyle;
  rowStyle?: ViewStyle;
  colStyle?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
}

const Table: React.FC<TableProps> = ({
  data,
  tableStyle,
  rowStyle,
  colStyle,
  labelStyle,
  valueStyle,
}) => {
  return (
    <View style={[styles.table, tableStyle]}>
      {data.map((row, index) => (
        <View key={index} style={[styles.row, rowStyle]}>
          <View style={[styles.col, colStyle]}>
            <Text style={[styles.label, labelStyle]}>{row.label1}</Text>
            <Text style={[styles.value, valueStyle, row.valueStyle1]}>{row.value1}</Text>
          </View>
          {row.label2 && (
            <View style={[styles.col, styles.rightCol, colStyle]}>
              <Text style={[styles.label, labelStyle]}>{row.label2}</Text>
              <Text style={[styles.value, valueStyle, row.valueStyle2]}>{row.value2}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default Table;

const styles = StyleSheet.create({
  table: {
      overflow: 'hidden',
    backgroundColor:'#fff'
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  col: {
    flex: 1,
    paddingVertical: hScale(6),
    paddingHorizontal: wScale(10),
    borderRightWidth: 0.5,
    borderColor: '#ddd',
  },
  rightCol: {
    borderRightWidth: 0,
    alignItems: 'flex-end',
  },
  label: {
    fontSize: wScale(12),
    color: '#555',
  },
  value: {
    fontSize: wScale(14),
    fontWeight: 'bold',
    color: '#000',
    marginTop: hScale(4),
  },
});
