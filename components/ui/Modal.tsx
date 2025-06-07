import {
  View,
  Modal as RNModal,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  visible: boolean;
  onClose: () => void;
}

export default function Modal({ children, visible, onClose }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>{children}</View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: "90%",
    flexGrow: 1, // ✅ allow children (like ScrollView) to expand
    flexShrink: 1,
  },
});
