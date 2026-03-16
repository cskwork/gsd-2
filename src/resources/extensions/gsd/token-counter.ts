import type { Tiktoken } from "tiktoken";

let encoder: Tiktoken | null = null;
let encoderFailed = false;

async function getEncoder(): Promise<Tiktoken | null> {
	if (encoder) return encoder;
	if (encoderFailed) return null;
	try {
		const { encoding_for_model } = await import("tiktoken");
		encoder = encoding_for_model("gpt-4o");
		return encoder;
	} catch {
		encoderFailed = true;
		return null;
	}
}

export async function countTokens(text: string): Promise<number> {
	const enc = await getEncoder();
	if (enc) {
		const tokens = enc.encode(text);
		return tokens.length;
	}
	return Math.ceil(text.length / 4);
}

export function countTokensSync(text: string): number {
	if (encoder) {
		return encoder.encode(text).length;
	}
	return Math.ceil(text.length / 4);
}

export async function initTokenCounter(): Promise<boolean> {
	const enc = await getEncoder();
	return enc !== null;
}

export function isAccurateCountingAvailable(): boolean {
	return encoder !== null;
}
