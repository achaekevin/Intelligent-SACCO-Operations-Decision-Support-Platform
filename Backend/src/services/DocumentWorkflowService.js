// Digital Document Workflow Service
export class DocumentWorkflowService {
  static documents = [
    {
      id: 'doc_101',
      memberId: 1,
      title: 'Loan Agreement Form - KES 450,000',
      category: 'LOAN_AGREEMENT',
      version: 'v2.1',
      approvalStatus: 'APPROVED', // DRAFT, UNDER_REVIEW, APPROVED, REJECTED, EXPIRED
      digitalSignature: {
        signedBy: 'John Kamau (Member)',
        signerId: 1,
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        signatureHash: 'sha256_9a8b7c6d5e4f3a2b1c',
        verified: true,
      },
      expiryDate: new Date(Date.now() + 86400000 * 365).toISOString(),
      fileUrl: '/uploads/documents/loan_agreement_450k.pdf',
      versions: [
        { version: 'v1.0', updatedAt: '2026-01-10', note: 'Initial draft created by Loan Officer' },
        { version: 'v2.0', updatedAt: '2026-01-12', note: 'Guarantor terms updated' },
        { version: 'v2.1', updatedAt: '2026-01-15', note: 'Digitally signed by member' },
      ],
      reviewHistory: [
        { reviewer: 'Mary Wambui (Loan Officer)', status: 'RECOMMENDED', date: '2026-01-11', comment: 'Terms verified' },
        { reviewer: 'Peter Njuguna (Branch Manager)', status: 'APPROVED', date: '2026-01-12', comment: 'Approved for member signature' },
      ],
    },
    {
      id: 'doc_102',
      memberId: 1,
      title: 'Guarantor Commitment Form - Jane Mutua',
      category: 'GUARANTOR_FORM',
      version: 'v1.0',
      approvalStatus: 'APPROVED',
      digitalSignature: {
        signedBy: 'Jane Mutua (Guarantor)',
        signerId: 202,
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        signatureHash: 'sha256_8f7e6d5c4b3a21',
        verified: true,
      },
      expiryDate: new Date(Date.now() + 86400000 * 365).toISOString(),
      fileUrl: '/uploads/documents/guarantor_form_jane.pdf',
      versions: [
        { version: 'v1.0', updatedAt: '2026-01-14', note: 'Guarantor submission' },
      ],
      reviewHistory: [
        { reviewer: 'Credit Committee', status: 'VERIFIED', date: '2026-01-15', comment: 'Guarantor savings ratio acceptable' },
      ],
    },
  ];

  static getMemberDocuments(memberId) {
    return this.documents.filter((d) => d.memberId === parseInt(memberId));
  }

  static signDocument(docId, signerName, signerId) {
    const doc = this.documents.find((d) => d.id === docId);
    if (!doc) throw new Error('Document not found');

    const hash = 'sha256_' + Math.random().toString(36).substring(2, 12);
    doc.digitalSignature = {
      signedBy: signerName,
      signerId,
      timestamp: new Date().toISOString(),
      signatureHash: hash,
      verified: true,
    };

    doc.approvalStatus = 'APPROVED';
    doc.reviewHistory.push({
      reviewer: signerName,
      status: 'DIGITALLY_SIGNED',
      date: new Date().toISOString().split('T')[0],
      comment: 'Digital cryptographic signature applied successfully',
    });

    return doc;
  }

  static addVersion(docId, note, fileUrl) {
    const doc = this.documents.find((d) => d.id === docId);
    if (!doc) throw new Error('Document not found');

    const currentMajor = parseInt(doc.version.replace('v', '').split('.')[0]) || 1;
    const nextVersion = `v${currentMajor + 1}.0`;

    doc.version = nextVersion;
    if (fileUrl) doc.fileUrl = fileUrl;
    doc.versions.push({
      version: nextVersion,
      updatedAt: new Date().toISOString().split('T')[0],
      note,
    });

    return doc;
  }
}

export default DocumentWorkflowService;
