import anthropicAiFluency from "#/assets/credentials/ai-fluency-for-students-anthropic.png?credential";
import anthropicClaudeCode101 from "#/assets/credentials/claude-code-101-anthropic.png?credential";

const CREDENTIAL_PREVIEWS: Record<string, ImagetoolsPicture> = {
	"anthropic-claude-code-101": anthropicClaudeCode101,
	"anthropic-ai-fluency-for-students": anthropicAiFluency,
};

export function getCredentialPreview(key: string): ImagetoolsPicture {
	const picture = CREDENTIAL_PREVIEWS[key];
	if (!picture) {
		throw new Error(
			`No preview registered for key "${key}" in credential-images.ts`,
		);
	}
	return picture;
}
