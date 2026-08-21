import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Linking
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../../assets/api';

const WalletScreen = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  // Deposit states
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPin, setDepositPin] = useState('');
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);

  // Withdraw states
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet/wallet/');
      setWallet(res.data);
      fetchTransactions();
    } catch (err) {
      console.log('Error fetching wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/wallet/transactions_list/');
      setTransactions(res.data);
    } catch (err) {
      console.log('Error fetching transactions:', err);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount) || !depositPin) {
      Alert.alert('Error', 'Please enter valid amount and PIN');
      return;
    }

    setIsProcessingDeposit(true);
    try {
      const response = await api.post('/wallet/deposit_money/', {
        pin: Number(depositPin),
        amount: Number(depositAmount)
      });

      if (response.data?.authorization_url) {
        const supported = await Linking.canOpenURL(response.data.authorization_url);
        if (supported) {
          await Linking.openURL(response.data.authorization_url);
          Alert.alert(
            'Payment Initialized', 
            'Please complete the payment in your browser',
            [
              { 
                text: 'OK', 
                onPress: () => {
                  setDepositModalVisible(false);
                  fetchWallet();
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', 'Unable to open payment link');
        }
      }
    } catch (err) {
      if (err.response?.data?.detail === 'Invalid PIN.') {
        Alert.alert('Invalid PIN', 'The PIN you entered is incorrect');
      } 
      else if (err.response?.data?.detail === 'You can only deposit once a week. Please try again later.') {
        Alert.alert(
          'Weekly Limit Reached',
          'You can only make one deposit per week. Please try again later.'
        );
      }
      else if (err.response?.data?.detail === 'PIN needed.') {
        Alert.alert('PIN Required', 'Please enter your 4-digit PIN');
      }
      else {
        Alert.alert(
          'Deposit Failed', 
          err.response?.data?.message || 'An error occurred while processing your deposit'
        );
      }
    } finally {
      setIsProcessingDeposit(false);
      setDepositAmount('');
      setDepositPin('');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(withdrawAmount) || !withdrawPin || 
        !bankName || !accountNumber || !accountName) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setIsProcessingWithdraw(true);
    try {
      const response = await api.post('/wallet/withdraw_money/', {
        pin: Number(withdrawPin),
        amount: Number(withdrawAmount),
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        description: description || 'Withdrawal'
      });

      Alert.alert(
        'Success', 
        `₦${withdrawAmount} withdrawal initiated successfully. Your transfer is being processed.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              setWithdrawModalVisible(false);
              fetchWallet();
            }
          }
        ]
      );
    } catch (err) {
      if (err.response?.data?.detail === 'Invalid PIN.') {
        Alert.alert('Invalid PIN', 'The PIN you entered is incorrect');
      } 
      else if (err.response?.data?.detail === 'Insufficient balance.') {
        Alert.alert(
          'Insufficient Balance',
          'You do not have enough funds to complete this withdrawal'
        );
      }
      else if (err.response?.data?.detail?.includes('bank_name, account_number')) {
        Alert.alert(
          'Bank Details Required',
          'Please provide all bank account details'
        );
      }
      else {
        Alert.alert(
          'Withdrawal Failed', 
          err.response?.data?.detail || 'An error occurred while processing your withdrawal'
        );
      }
    } finally {
      setIsProcessingWithdraw(false);
      setWithdrawAmount('');
      setWithdrawPin('');
      setBankName('');
      setAccountNumber('');
      setAccountName('');
      setDescription('');
    }
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const groupTransactionsByMonth = (transactions) => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const grouped = sorted.reduce((acc, tx) => {
      const date = new Date(tx.created_at);
      const month = date.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });

      if (!acc[month]) acc[month] = [];
      acc[month].push(tx);
      return acc;
    }, {});

    return Object.keys(grouped).map((month) => ({
      month,
      data: grouped[month],
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009b7c" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  if (!wallet) {
    return (
      <View style={styles.emptyWalletContainer}>
        <MaterialIcons name="account-balance-wallet" size={48} color="#6b7280" />
        <Text style={styles.emptyWalletText}>No wallet found</Text>
      </View>
    );
  }

  const displayedTransactions = showFullHistory 
    ? groupTransactionsByMonth(transactions) 
    : groupTransactionsByMonth(transactions).slice(0, 2);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <Text style={styles.headerSubtitle}>Account: {wallet.wallet_name}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchWallet}>
          <Ionicons name="refresh" size={20} color="#009b7c" />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <TouchableOpacity onPress={toggleBalanceVisibility}>
            <MaterialIcons 
              name={balanceVisible ? 'visibility-off' : 'visibility'} 
              size={20} 
              color="#9ca3af" 
            />
          </TouchableOpacity>
        </View>
        
        {balanceVisible ? (
          <Text style={styles.balanceAmount}>₦{wallet.user_balance}</Text>
        ) : (
          <View style={styles.hiddenBalance}>
            <Text style={styles.balanceAmount}>******</Text>
          </View>
        )}
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.depositButton]}
            onPress={() => setDepositModalVisible(true)}
          >
            <MaterialIcons name="arrow-downward" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Deposit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.withdrawButton]}
            onPress={() => setWithdrawModalVisible(true)}
          >
            <MaterialIcons name="arrow-upward" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transactions */}
      <ScrollView style={styles.transactionsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <TouchableOpacity onPress={() => setShowFullHistory(!showFullHistory)}>
            <Text style={styles.viewAllText}>
              {showFullHistory ? 'Show Less' : 'View All'}
            </Text>
          </TouchableOpacity>
        </View>

        {transactions.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={displayedTransactions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.monthSection}>
                <Text style={styles.monthHeader}>{item.month}</Text>
                {item.data.map((tx) => (
                  <View key={tx.id} style={[
                    styles.transactionCard,
                    tx.transaction_type === 'credit' ? styles.creditCard : styles.debitCard
                  ]}>
                    <View style={styles.transactionHeader}>
                      <MaterialIcons 
                        name={tx.transaction_type === 'credit' ? 'arrow-downward' : 'arrow-upward'} 
                        size={20} 
                        color={tx.transaction_type === 'credit' ? '#10b981' : '#ef4444'} 
                      />
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionType}>
                          {tx.transaction_type === 'credit' ? 'Deposit' : 'Withdrawal'}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {new Date(tx.created_at).toLocaleDateString()}
                        </Text>
                        {tx.description && (
                          <Text style={styles.transactionDescription}>
                            {tx.description}
                          </Text>
                        )}
                        <Text style={styles.transactionStatus}>
                          Status: {tx.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      tx.transaction_type === 'credit' ? styles.creditAmount : styles.debitAmount
                    ]}>
                      {tx.transaction_type === 'credit' ? '+' : '-'}₦{tx.amount}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="info-outline" size={24} color="#6b7280" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={depositModalVisible}
        onRequestClose={() => setDepositModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setDepositModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Deposit Funds</Text>
            
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>Amount (₦)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0.00"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                value={depositAmount}
                onChangeText={setDepositAmount}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>PIN</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your 4-digit PIN"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                value={depositPin}
                onChangeText={setDepositPin}
              />
            </View>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.depositButton]}
              onPress={handleDeposit}
              disabled={isProcessingDeposit}
            >
              {isProcessingDeposit ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Proceed to Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={withdrawModalVisible}
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { paddingBottom: 30 }]}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setWithdrawModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Withdraw Funds</Text>
            
            <ScrollView>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>Amount (₦)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0.00"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>Bank Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. First Bank"
                  placeholderTextColor="#6b7280"
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>Account Number</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0123456789"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>Account Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="John Doe"
                  placeholderTextColor="#6b7280"
                  value={accountName}
                  onChangeText={setAccountName}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>Description (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. For medical bills"
                  placeholderTextColor="#6b7280"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>PIN</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter your 4-digit PIN"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  value={withdrawPin}
                  onChangeText={setWithdrawPin}
                />
              </View>
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.withdrawButton]}
              onPress={handleWithdraw}
              disabled={isProcessingWithdraw}
            >
              {isProcessingWithdraw ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Withdraw Funds</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f14',
  },
  loadingText: {
    color: '#009b7c',
    marginTop: 16,
  },
  emptyWalletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f14',
  },
  emptyWalletText: {
    color: '#9ca3af',
    fontSize: 18,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#0f0f14',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 24,
  },
  hiddenBalance: {
    height: 48,
    justifyContent: 'center',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
  },
  depositButton: {
    backgroundColor: '#10b981',
  },
  withdrawButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  viewAllText: {
    color: '#009b7c',
    fontSize: 14,
    fontWeight: '600',
  },
  monthSection: {
    marginBottom: 16,
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#009b7c',
    marginBottom: 12,
  },
  transactionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 70,
  },
  creditCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  debitCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  transactionDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  transactionStatus: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  creditAmount: {
    color: '#10b981',
  },
  debitAmount: {
    color: '#ef4444',
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#1f2937',
    borderRadius: 12,
  },
  emptyText: {
    color: '#9ca3af',
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    position: 'relative',
    maxHeight: '80%',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalInputContainer: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
  },
  modalButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WalletScreen;