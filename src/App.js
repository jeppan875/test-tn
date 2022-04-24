import React, { useEffect, useState } from 'react'

import './app.css'

import View from './components/layout/View'

import Heading from './components/layout/Heading'
import useData from './hooks/useData'
import useTickets from './hooks/useTickets'
import useMarkets from './hooks/useMarkets'
import Table from './components/layout/Table'
import InputInteger from './components/input/InputInteger'
import ActionCTA from './components/action/ActionCTA'

const App = () => {

  const { data, isLoaded: isDataLoaded } = useData();
  const { data: tickets, isLoaded: isTicketsLoaded } = useTickets();
  const { data: markets, isLoaded: isMarketsLoaded } = useMarkets();
  const loading = !isDataLoaded || !isTicketsLoaded || !isMarketsLoaded;

  const [fields, setFields] = useState({});
  
  // Set the initial data for the fields object
  useSetInitialTableData({
    loading,
    data,
    markets,
    tickets,
    setFields
  });

  if (loading) {
    return <Heading level={3} title={'Loading data'} />;
  }

  const onChange = (field, value) => {
    setFields({...fields, [field]: value})
  };

  const onSubmit = () => {
    // Remove properties that don't hold a value higher than 0
    const filteredFields = Object.keys(fields).reduce((acc, key) => {
      if (fields[key] > 0) {
        acc[key] = fields[key];
      }
      return acc;
    }, {});
    // Final submitted data
    console.log(filteredFields)
  };

  const columns = [{ key: 'title', label: 'Ticket' }, ...markets.map(t => ({ key: t.market_id, label: t.title }))];

  const rows = tickets.map(ticket => {
    return columns.reduce((acc, column) => {
      if (column.key === 'title') {
        acc[column.key] = ticket.title
      } else {
        const fieldKey = `${column.key}-${ticket.ticket_id}`;
        const value =  fields[fieldKey] || 0;
        acc[column.key] = <InputInteger field={fieldKey} value={value} change={onChange} />
      }
      return acc
    }, {});
  });

  return (
    <View>
      <Heading level={1} title={'Pricing Matrix'} />
      <p>Add your implementation here. See the README for details.</p>
      <Table columns={columns} data={rows} />
      <ActionCTA change={onSubmit}>Save</ActionCTA>
    </View>
  )
}

const useSetInitialTableData = ({ loading, data, markets, tickets, setFields }) => {
  useEffect(() => {
    if (!loading) {
      // Key-value pair object that holds the initial data
      const initialData = data.reduce((acc, curr) => {
        acc[`${curr.market_id}-${curr.ticket_id}`] = curr.value;
        return acc;
      }, {});
      // Set the data structure to a key-value pair for easier access and manipulation
      const initilaFields = markets.reduce((acc, market) => {
        tickets.forEach(ticket => {
          const key = `${market.market_id}-${ticket.ticket_id}`;
          acc[key] = initialData[key] || 0;
        });
        return acc;
      }, {});
      setFields(initilaFields);
    }
  }, [loading, data, markets, tickets, setFields]);
}

export default App
