import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Briefcase, Building2, FileText, CheckCircle2, Phone, Mail } from 'lucide-react-native';
import api from '../services/api';

export const WholesaleScreen: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [requirements, setRequirements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!companyName || !contactPerson || !phone || !email || !requirements) {
      Alert.alert('Missing Fields', 'Please fill in all required fields marked with *');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/wholesale/quote', {
        company_name: companyName,
        contact_person: contactPerson,
        phone,
        email,
        gstin,
        requirements,
      });

      if (res.data) {
        setSubmittedId(res.data.quote_id || 'SBS-QT-SUCCESS');
      }
    } catch (err: any) {
      Alert.alert('Submission Failed', err?.response?.data?.detail || 'Could not submit wholesale quote.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Briefcase color="#C5A059" size={24} />
        </View>
        <Text style={styles.headerSub}>B2B & INSTITUTIONAL SUPPLY</Text>
        <Text style={styles.headerTitle}>Wholesale & Corporate Quotation</Text>
        <Text style={styles.headerDesc}>
          Direct manufacturer pricing for jewelry retailers, temple trusts, wedding planners, and corporate gifting.
        </Text>
      </View>

      {/* Benefits Card */}
      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>Wholesale Privileges</Text>
        
        <View style={styles.benefitItem}>
          <CheckCircle2 color="#C5A059" size={16} />
          <Text style={styles.benefitText}>BIS 92.5% & 99.9% Purity Guaranteed</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle2 color="#C5A059" size={16} />
          <Text style={styles.benefitText}>Custom Logo & Name Engraving on Silver Coins</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle2 color="#C5A059" size={16} />
          <Text style={styles.benefitText}>GST Invoice & Insured Logistics Across India</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle2 color="#C5A059" size={16} />
          <Text style={styles.benefitText}>Tiered Quantity Pricing for Bulk Procurement</Text>
        </View>
      </View>

      {/* Quote Form */}
      {submittedId ? (
        <View style={styles.successCard}>
          <CheckCircle2 color="#276749" size={48} />
          <Text style={styles.successTitle}>Quotation Request Submitted!</Text>
          <Text style={styles.quoteId}>Request ID: {submittedId}</Text>
          <Text style={styles.successDesc}>
            Our B2B wholesale department will review your specifications and issue an official proforma quotation within 24 hours.
          </Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setSubmittedId(null);
              setRequirements('');
            }}
          >
            <Text style={styles.resetBtnText}>Submit Another Request</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Request Wholesale Quotation</Text>

          <Text style={styles.label}>Company / Business Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sai Silver Jewellers Pvt Ltd"
            placeholderTextColor="#999"
            value={companyName}
            onChangeText={setCompanyName}
          />

          <Text style={styles.label}>Contact Person Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Full Name"
            placeholderTextColor="#999"
            value={contactPerson}
            onChangeText={setContactPerson}
          />

          <Text style={styles.label}>Phone Number (WhatsApp preferred) *</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 98765 00000"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Business Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="name@company.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>GSTIN Number (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="36AAAAA0000A1Z5"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            value={gstin}
            onChangeText={setGstin}
          />

          <Text style={styles.label}>Product Requirements & Estimated Quantities *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe products (e.g. 500 grams Silver Coins 99.9, 50 sets Silver Pooja Bowls, custom gift boxes, target delivery date...)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={requirements}
            onChangeText={setRequirements}
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#1A1918" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Quotation Request</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  header: {
    backgroundColor: '#1A1918',
    padding: 24,
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerSub: {
    color: '#C5A059',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerDesc: {
    color: '#D4CEB8',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  benefitsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1DA',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1918',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#444',
  },
  formCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1DA',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1918',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FAF9F5',
    borderWidth: 1,
    borderColor: '#E6E1DA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1A1918',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#C5A059',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#1A1918',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  successCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#276749',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1918',
    marginTop: 12,
  },
  quoteId: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C5A059',
    marginTop: 4,
  },
  successDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 20,
  },
  resetBtn: {
    backgroundColor: '#1A1918',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetBtnText: {
    color: '#FAF9F5',
    fontSize: 12,
    fontWeight: '600',
  },
});
