# Municipal Contacts Integration Guide

## Overview
This guide explains how to integrate the South African municipal contact data into the CityWatcher app.

## Files Created

### 1. Data File
**Location:** `src/constants/municipalContacts.ts`

Contains:
- TypeScript interface for contact structure
- Complete array of 60+ municipal contacts
- Helper functions for filtering and searching
- National emergency numbers

## Integration Steps

### Step 1: Create Emergency Contacts Screen

Create a new screen to display emergency contacts:

```typescript
// src/screens/EmergencyContactsScreen.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking } from 'react-native';
import { MUNICIPAL_CONTACTS, NATIONAL_EMERGENCY, getContactsByRegion } from '../constants/municipalContacts';

export default function EmergencyContactsScreen() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  
  const contacts = selectedRegion === 'all' 
    ? MUNICIPAL_CONTACTS 
    : getContactsByRegion(selectedRegion);
  
  const callNumber = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };
  
  return (
    <View>
      {/* Region filter buttons */}
      {/* Contact list */}
    </View>
  );
}
```

### Step 2: Add to Navigation

Update `src/navigation/AppNavigator.tsx`:

```typescript
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';

// Add to stack navigator
<Stack.Screen 
  name="EmergencyContacts" 
  component={EmergencyContactsScreen}
  options={{ title: 'Emergency Contacts' }}
/>
```

### Step 3: Add Quick Access Button

Add to HomeScreen.tsx:

```typescript
<TouchableOpacity 
  onPress={() => navigation.navigate('EmergencyContacts')}
>
  <Text>📞 Emergency Contacts</Text>
</TouchableOpacity>
```

### Step 4: Integrate with Report Form

When user creates a report, suggest relevant contacts:

```typescript
// In ReportFormScreen.tsx
import { getContactsByMunicipality } from '../constants/municipalContacts';

const suggestedContacts = getContactsByMunicipality(userMunicipality);
```

### Step 5: Add Search Functionality

```typescript
import { searchContacts } from '../constants/municipalContacts';

const [searchQuery, setSearchQuery] = useState('');
const results = searchContacts(searchQuery);
```

## UI Components to Create

### 1. ContactCard Component

```typescript
interface ContactCardProps {
  contact: MunicipalContact;
  onCall: (phone: string) => void;
  onEmail?: (email: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onCall, onEmail }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.serviceName}>{contact.serviceName}</Text>
      <Text style={styles.municipality}>{contact.municipality}</Text>
      
      {contact.is24Hour && (
        <Badge text="24/7" color={Colors.successGreen} />
      )}
      
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onCall(contact.phone)}>
          <Icon name="phone" />
          <Text>{contact.phone}</Text>
        </TouchableOpacity>
        
        {contact.email && (
          <TouchableOpacity onPress={() => onEmail(contact.email)}>
            <Icon name="email" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
```

### 2. RegionFilter Component

```typescript
const RegionFilter = ({ selected, onSelect }) => {
  const regions = ['all', 'KZN', 'Western Cape', 'Gauteng'];
  
  return (
    <View style={styles.filterContainer}>
      {regions.map(region => (
        <TouchableOpacity
          key={region}
          onPress={() => onSelect(region)}
          style={[
            styles.filterButton,
            selected === region && styles.filterButtonActive
          ]}
        >
          <Text>{region}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### 3. EmergencyBanner Component

```typescript
const EmergencyBanner = () => {
  return (
    <View style={styles.emergencyBanner}>
      <Text style={styles.emergencyTitle}>National Emergency Numbers</Text>
      <TouchableOpacity onPress={() => Linking.openURL('tel:112')}>
        <Text style={styles.emergencyNumber}>📱 112 - Mobile Emergency</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL('tel:10111')}>
        <Text style={styles.emergencyNumber}>🚔 10111 - Police (SAPS)</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL('tel:10177')}>
        <Text style={styles.emergencyNumber}>🚑 10177 - Ambulance</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Features to Implement

### Priority 1 (Essential)
- [x] Contact data structure created
- [ ] Emergency contacts screen
- [ ] Call functionality
- [ ] Region filtering
- [ ] Search functionality
- [ ] Add to navigation

### Priority 2 (Important)
- [ ] Email functionality
- [ ] WhatsApp integration (for contacts with WhatsApp)
- [ ] SMS functionality
- [ ] Favorite contacts
- [ ] Recent contacts history
- [ ] Share contact details

### Priority 3 (Nice to Have)
- [ ] Offline access
- [ ] Contact availability status
- [ ] Language preference filtering
- [ ] Map view of contact locations
- [ ] Report directly to specific department
- [ ] Contact feedback/ratings

## Usage Examples

### Example 1: Get All Emergency Contacts
```typescript
import { getEmergencyContacts } from '../constants/municipalContacts';

const emergencyList = getEmergencyContacts();
// Returns all contacts with category: 'emergency'
```

### Example 2: Get Contacts for Specific Municipality
```typescript
import { getContactsByMunicipality } from '../constants/municipalContacts';

const durbanContacts = getContactsByMunicipality('Durban');
// Returns all eThekwini contacts
```

### Example 3: Search for Water Services
```typescript
import { searchContacts } from '../constants/municipalContacts';

const waterContacts = searchContacts('water');
// Returns all contacts related to water services
```

### Example 4: Get 24-Hour Services
```typescript
import { get24HourContacts } from '../constants/municipalContacts';

const alwaysAvailable = get24HourContacts();
// Returns only 24/7 services
```

## Styling Guidelines

Use the existing CityWatcher theme:

```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  emergencyCard: {
    backgroundColor: Colors.emergencyRedLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.emergencyRed,
  },
  utilityCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryOrange,
  },
  badge24Hour: {
    backgroundColor: Colors.successGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
});
```

## Testing Checklist

- [ ] All phone numbers are clickable and dial correctly
- [ ] Email links open email client
- [ ] WhatsApp numbers open WhatsApp
- [ ] Search returns relevant results
- [ ] Filters work correctly
- [ ] UI is responsive on different screen sizes
- [ ] Offline mode works (if implemented)
- [ ] Contact details are accurate
- [ ] 24/7 badges display correctly
- [ ] Region filtering works

## Future Enhancements

1. **Auto-detect User Location**
   - Use GPS to determine user's municipality
   - Show relevant contacts first

2. **Smart Suggestions**
   - Based on report category, suggest appropriate contact
   - "Report pothole" → Show roads department contact

3. **Integration with Report System**
   - One-tap to call and create report simultaneously
   - Auto-populate municipality field

4. **Contact Verification**
   - Periodic checks to ensure numbers are still active
   - User feedback on contact accuracy

5. **Multi-language Support**
   - Display service names in user's preferred language
   - Zulu, Xhosa, Afrikaans translations

## Admin Dashboard Integration

The admin dashboard should also have access to this data:

1. **Contact Management**
   - CRUD operations for contacts
   - Bulk import/export
   - Verification status tracking

2. **Analytics**
   - Most called contacts
   - Response time tracking
   - Contact usage by region

3. **Updates**
   - Easy way to update contact information
   - Change history tracking
   - Notification when contacts change

## Data Maintenance

### Updating Contacts

To add or update contacts, edit `src/constants/municipalContacts.ts`:

```typescript
{
  id: 'unique-id',
  serviceName: 'Service Name',
  department: 'Department',
  region: 'KZN' | 'Western Cape' | 'Gauteng',
  municipality: 'Municipality Name',
  phone: '000 000 0000',
  tollFree: '0800 000 000', // optional
  email: 'email@municipality.gov.za', // optional
  smsWhatsApp: '000 000 0000', // optional
  hours: 'Operating hours',
  is24Hour: true | false,
  website: 'https://...', // optional
  address: 'Physical address', // optional
  languages: ['English', 'Zulu'],
  category: 'emergency' | 'municipal' | 'reporting' | 'utility',
  priority: 'high' | 'medium' | 'low',
}
```

### Verification Schedule

- **Monthly**: Check high-priority emergency numbers
- **Quarterly**: Verify all 24/7 services
- **Bi-annually**: Full contact database audit

## Support

For questions or issues with contact integration:
1. Check this guide first
2. Review the TypeScript interface in `municipalContacts.ts`
3. Test with sample data before production

---

**Last Updated:** 24 February 2026  
**Data Source:** Official .gov.za websites  
**Next Review:** May 2026
