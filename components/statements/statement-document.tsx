// components/statements/statement-document.tsx

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    DocumentProps,
} from "@react-pdf/renderer"
import { format } from "date-fns"

// ─── Types ────────────────────────────────────────────────────
type StatementTransaction = {
    id: string
    reference: string
    type: string
    status: string
    amount: string
    currency: string
    description: string | null
    createdAt: Date
    isSender: boolean
    counterpartName: string
    counterpartAccount: string
}

type StatementData = {
    user: {
        fullName: string
        email: string
        phone: string
    }
    account: {
        accountNumber: string
        accountType: string
        currency: string
    }
    period: {
        month: string
        year: string
        startDate: Date
        endDate: Date
    }
    summary: {
        openingBalance: number
        closingBalance: number
        totalCredits: number
        totalDebits: number
        totalTransactions: number
    }
    transactions: StatementTransaction[]
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 9,
        paddingTop: 40,
        paddingBottom: 60,
        paddingHorizontal: 40,
        backgroundColor: "#ffffff",
    },

    // ── Header ──
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: "#1e40af",
    },
    bankName: {
        fontSize: 22,
        fontFamily: "Helvetica-Bold",
        color: "#1e40af",
    },
    bankTagline: {
        fontSize: 8,
        color: "#64748b",
        marginTop: 2,
    },
    headerRight: {
        alignItems: "flex-end",
    },
    statementTitle: {
        fontSize: 14,
        fontFamily: "Helvetica-Bold",
        color: "#1e293b",
    },
    statementPeriod: {
        fontSize: 9,
        color: "#64748b",
        marginTop: 4,
    },
    generatedAt: {
        fontSize: 7,
        color: "#94a3b8",
        marginTop: 2,
    },

    // ── Info Section ──
    infoSection: {
        flexDirection: "row",
        gap: 20,
        marginBottom: 24,
    },
    infoBox: {
        flex: 1,
        backgroundColor: "#f8fafc",
        borderRadius: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    infoBoxTitle: {
        fontSize: 7,
        fontFamily: "Helvetica-Bold",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    infoLabel: {
        color: "#64748b",
        fontSize: 8,
    },
    infoValue: {
        fontFamily: "Helvetica-Bold",
        color: "#1e293b",
        fontSize: 8,
    },

    // ── Summary Cards ──
    summarySection: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 24,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 6,
        padding: 12,
        alignItems: "center",
    },
    summaryCardBlue: {
        backgroundColor: "#eff6ff",
        borderWidth: 1,
        borderColor: "#bfdbfe",
    },
    summaryCardGreen: {
        backgroundColor: "#f0fdf4",
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    summaryCardRed: {
        backgroundColor: "#fef2f2",
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    summaryCardGray: {
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    summaryLabel: {
        fontSize: 7,
        color: "#64748b",
        textAlign: "center",
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
        textAlign: "center",
    },
    summaryValueBlue: { color: "#1d4ed8" },
    summaryValueGreen: { color: "#16a34a" },
    summaryValueRed: { color: "#dc2626" },
    summaryValueGray: { color: "#475569" },

    // ── Table ──
    tableSection: {
        marginBottom: 24,
    },
    tableSectionTitle: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#1e293b",
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#1e40af",
        borderRadius: 4,
        paddingVertical: 7,
        paddingHorizontal: 8,
        marginBottom: 2,
    },
    tableHeaderText: {
        color: "#ffffff",
        fontFamily: "Helvetica-Bold",
        fontSize: 7,
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 7,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    tableRowEven: {
        backgroundColor: "#f8fafc",
    },
    tableRowOdd: {
        backgroundColor: "#ffffff",
    },
    tableCell: {
        fontSize: 8,
        color: "#334155",
    },
    tableCellBold: {
        fontFamily: "Helvetica-Bold",
    },
    tableCellCredit: {
        color: "#16a34a",
        fontFamily: "Helvetica-Bold",
    },
    tableCellDebit: {
        color: "#dc2626",
        fontFamily: "Helvetica-Bold",
    },

    // Column widths
    colDate: { width: "14%" },
    colReference: { width: "18%" },
    colDescription: { width: "26%" },
    colCounterpart: { width: "18%" },
    colType: { width: "10%" },
    colAmount: { width: "14%", alignItems: "flex-end" },

    // ── Footer ──
    footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
        paddingTop: 12,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: {
        fontSize: 7,
        color: "#94a3b8",
    },
    footerWarning: {
        fontSize: 6,
        color: "#cbd5e1",
        textAlign: "center",
        marginTop: 4,
    },

    // ── No Transactions ──
    noTransactions: {
        textAlign: "center",
        color: "#94a3b8",
        padding: 30,
        fontSize: 9,
    },
})

// ─── Helper ───────────────────────────────────────────────────
function formatAmount(amount: string, currency: string): string {
    const value = parseFloat(amount)
    if (currency === "KHR") {
        return `₭${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
    }
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Main PDF Document ────────────────────────────────────────
export function StatementDocument({ data }: { data: StatementData } & Partial<DocumentProps>) {
    const {
        user,
        account,
        period,
        summary,
        transactions,
    } = data

    return (
        <Document
            title={`Bank Statement - ${period.month} ${period.year}`}
            author="KhmerBank"
            subject="Account Statement"
            creator="KhmerBank Digital Banking"
        >
            <Page size="A4" style={styles.page}>

                {/* ── Header ────────────────────────────────────────── */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.bankName}>KhmerBank</Text>
                        <Text style={styles.bankTagline}>Digital Banking · Phnom Penh, Cambodia</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.statementTitle}>Account Statement</Text>
                        <Text style={styles.statementPeriod}>
                            {format(period.startDate, "dd MMM yyyy")} — {format(period.endDate, "dd MMM yyyy")}
                        </Text>
                        <Text style={styles.generatedAt}>
                            Generated: {format(new Date(), "dd MMM yyyy, HH:mm")}
                        </Text>
                    </View>
                </View>

                {/* ── Account & Customer Info ────────────────────────── */}
                <View style={styles.infoSection}>

                    {/* Customer Info */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoBoxTitle}>Account Holder</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Name</Text>
                            <Text style={styles.infoValue}>{user.fullName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{user.email}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{user.phone}</Text>
                        </View>
                    </View>

                    {/* Account Info */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoBoxTitle}>Account Details</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Account Number</Text>
                            <Text style={styles.infoValue}>{account.accountNumber}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Account Type</Text>
                            <Text style={styles.infoValue}>{account.accountType}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Currency</Text>
                            <Text style={styles.infoValue}>{account.currency}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Statement Period</Text>
                            <Text style={styles.infoValue}>{period.month} {period.year}</Text>
                        </View>
                    </View>

                </View>

                {/* ── Summary Cards ──────────────────────────────────── */}
                <View style={styles.summarySection}>
                    <View style={[styles.summaryCard, styles.summaryCardBlue]}>
                        <Text style={styles.summaryLabel}>Opening Balance</Text>
                        <Text style={[styles.summaryValue, styles.summaryValueBlue]}>
                            {formatAmount(summary.openingBalance.toString(), account.currency)}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, styles.summaryCardGreen]}>
                        <Text style={styles.summaryLabel}>Total Credits</Text>
                        <Text style={[styles.summaryValue, styles.summaryValueGreen]}>
                            +{formatAmount(summary.totalCredits.toString(), account.currency)}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, styles.summaryCardRed]}>
                        <Text style={styles.summaryLabel}>Total Debits</Text>
                        <Text style={[styles.summaryValue, styles.summaryValueRed]}>
                            -{formatAmount(summary.totalDebits.toString(), account.currency)}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, styles.summaryCardBlue]}>
                        <Text style={styles.summaryLabel}>Closing Balance</Text>
                        <Text style={[styles.summaryValue, styles.summaryValueBlue]}>
                            {formatAmount(summary.closingBalance.toString(), account.currency)}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, styles.summaryCardGray]}>
                        <Text style={styles.summaryLabel}>Total Transactions</Text>
                        <Text style={[styles.summaryValue, styles.summaryValueGray]}>
                            {summary.totalTransactions}
                        </Text>
                    </View>
                </View>

                {/* ── Transaction Table ──────────────────────────────── */}
                <View style={styles.tableSection}>
                    <Text style={styles.tableSectionTitle}>Transaction Details</Text>

                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
                        <Text style={[styles.tableHeaderText, styles.colReference]}>Reference</Text>
                        <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
                        <Text style={[styles.tableHeaderText, styles.colCounterpart]}>Counterpart</Text>
                        <Text style={[styles.tableHeaderText, styles.colType]}>Type</Text>
                        <Text style={[styles.tableHeaderText, styles.colAmount, { textAlign: "right" }]}>
                            Amount
                        </Text>
                    </View>

                    {/* Table Rows */}
                    {transactions.length === 0 ? (
                        <Text style={styles.noTransactions}>
                            No transactions found for this period.
                        </Text>
                    ) : (
                        transactions.map((txn, index) => (
                            <View
                                key={txn.id}
                                style={[
                                    styles.tableRow,
                                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                                ]}
                            >
                                <Text style={[styles.tableCell, styles.colDate]}>
                                    {format(new Date(txn.createdAt), "dd MMM yy")}
                                </Text>
                                <Text style={[styles.tableCell, styles.colReference]}>
                                    {txn.reference}
                                </Text>
                                <Text style={[styles.tableCell, styles.colDescription]}>
                                    {txn.description ?? txn.type}
                                </Text>
                                <Text style={[styles.tableCell, styles.colCounterpart]}>
                                    {txn.counterpartName}
                                </Text>
                                <Text style={[styles.tableCell, styles.colType]}>
                                    {txn.isSender ? "Debit" : "Credit"}
                                </Text>
                                <Text style={[
                                    styles.tableCell,
                                    styles.colAmount,
                                    txn.isSender ? styles.tableCellDebit : styles.tableCellCredit,
                                ]}>
                                    {txn.isSender ? "-" : "+"}{formatAmount(txn.amount, txn.currency)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* ── Footer ────────────────────────────────────────── */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        KhmerBank · Phnom Penh, Cambodia · support@khmerbank.com
                    </Text>
                    <Text style={styles.footerText}>
                        Ref: STMT-{period.year}{period.month.toUpperCase().slice(0, 3)}-{account.accountNumber.slice(-4)}
                    </Text>
                </View>

                <Text
                    style={styles.footerWarning}
                    fixed
                    render={({ pageNumber, totalPages }) =>
                        `This is an official bank statement. Page ${pageNumber} of ${totalPages}. For disputes, contact support within 30 days.`
                    }
                />

            </Page>
        </Document>
    )
}