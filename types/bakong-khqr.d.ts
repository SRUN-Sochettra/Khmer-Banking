// types/bakong-khqr.d.ts

declare module "bakong-khqr" {
    export interface KHQRResponseData {
        qr: string
        md5: string
    }

    export interface KHQRStatus {
        code: number
        errorMessage?: string
    }

    export interface KHQRResponse {
        data?: KHQRResponseData
        status?: KHQRStatus
    }

    export interface IndividualOptional {
        accountInformation?: string
        acquiringBank?: string
        currency?: number
        amount?: number
        billNumber?: string
        storeLabel?: string
        terminalLabel?: string
        mobileNumber?: string
        purposeOfTransaction?: string
        languagePreference?: string
        merchantNameAlternateLanguage?: string
        merchantCityAlternateLanguage?: string
        upiMerchantAccount?: string
        expirationTimestamp?: string
        merchantCategoryCode?: string
    }

    export class IndividualInfo {
        constructor(
            bakongAccountID: string,
            merchantName: string,
            merchantCity: string,
            optional?: IndividualOptional
        )
    }

    export class MerchantInfo {
        constructor(
            bakongAccountID: string,
            merchantName: string,
            merchantCity: string,
            merchantID: string,
            acquiringBank: string,
            optional?: IndividualOptional
        )
    }

    export const khqrData: {
        currency: {
            usd: 840
            khr: 116
        }
        merchantType: {
            merchant: "merchant"
            individual: "individual"
        }
    }

    export class BakongKHQR {
        generateIndividual(individualInfo: IndividualInfo): KHQRResponse
        generateMerchant(merchantInfo: MerchantInfo): KHQRResponse
        static decode(KHQRString: string): KHQRResponse
        static decodeNonKhqr(KHQRString: string): KHQRResponse
        static verify(KHQRString: string): { isValid: boolean }
        static generateDeepLink(
            url: string,
            qr: string,
            sourceInfo?: unknown
        ): Promise<KHQRResponse>
        static checkBakongAccount(
            url: string,
            bakongID: string
        ): Promise<KHQRResponse>
    }
}