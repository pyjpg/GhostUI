import React, { FC } from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import type { Document as DocType } from '../types/Document';


const styles = StyleSheet.create({
    page: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        padding: 20,
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
});

type PDFDocProps = {
  document: DocType;
};

const PDFDoc = ({ document }: PDFDocProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>{document.title}</Text>
      </View>
      <View style={styles.section}>
        <Text>{document.description}</Text>
      </View>
      <View style={styles.section}>
        <Text>Last Modified: {document.lastModified}</Text>
      </View>
    </Page>
  </Document>
);

export default PDFDoc;
