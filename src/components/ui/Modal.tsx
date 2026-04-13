import React from 'react';
import { Modal as RNModal, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors } from '@/styles/colors';
import { spacing, typography } from '@/styles/spacing';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ visible, onClose, title, children }) => {
  return (
    <RNModal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    width: '85%',
  },
  title: {
    ...typography.h3,
    color: colors.secondary,
    marginBottom: spacing.lg,
  },
  closeButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    ...typography.button,
    color: colors.textInverse,
  },
});
