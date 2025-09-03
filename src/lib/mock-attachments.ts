import { MedicalAttachment } from "./mock-data";

export const generateMockAttachments = (recordType: string, recordTitle: string): MedicalAttachment[] => {
  const now = new Date();
  const baseId = Date.now();
  
  const attachmentTemplates = {
    lab: [
      {
        filename: `${recordTitle.replace(/\s+/g, '_')}_Results_${now.toISOString().split('T')[0]}.pdf`,
        fileType: 'pdf' as const,
        mimeType: 'application/pdf',
        size: Math.floor(Math.random() * 300000) + 150000, // 150KB - 450KB
        description: `Laboratory test results and analysis`,
        uploadedBy: 'Lab Technician'
      },
      {
        filename: `Reference_Values_${recordType}.pdf`,
        fileType: 'pdf' as const,
        mimeType: 'application/pdf',
        size: Math.floor(Math.random() * 200000) + 100000, // 100KB - 300KB
        description: `Reference ranges and normal values`,
        uploadedBy: 'Lab System'
      }
    ],
    imaging: [
      {
        filename: `${recordTitle.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.dcm`,
        fileType: 'image' as const,
        mimeType: 'application/dicom',
        size: Math.floor(Math.random() * 3000000) + 1000000, // 1MB - 4MB
        description: `Medical imaging study in DICOM format`,
        uploadedBy: 'Imaging Technician',
        thumbnailUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      },
      {
        filename: `Radiology_Report_${now.toISOString().split('T')[0]}.pdf`,
        fileType: 'pdf' as const,
        mimeType: 'application/pdf',
        size: Math.floor(Math.random() * 250000) + 150000, // 150KB - 400KB
        description: `Radiologist interpretation and findings`,
        uploadedBy: 'Radiologist'
      }
    ],
    prescription: [
      {
        filename: `Prescription_${recordTitle.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`,
        fileType: 'pdf' as const,
        mimeType: 'application/pdf',
        size: Math.floor(Math.random() * 150000) + 80000, // 80KB - 230KB
        description: `Electronic prescription document`,
        uploadedBy: 'Prescribing Physician'
      },
      {
        filename: `Medication_Guide_${recordTitle.split(' ')[0]}.pdf`,
        fileType: 'pdf' as const,
        mimeType: 'application/pdf',
        size: Math.floor(Math.random() * 600000) + 400000, // 400KB - 1MB
        description: `Patient medication guide and safety information`,
        uploadedBy: 'Pharmacy System'
      }
    ],
    visit: [
      {
        filename: `Visit_Summary_${now.toISOString().split('T')[0]}.pdf`,
        fileType: 'pdf' as const,
        mimeType: 'application/pdf',
        size: Math.floor(Math.random() * 400000) + 200000, // 200KB - 600KB
        description: `Comprehensive visit summary and treatment plan`,
        uploadedBy: 'Attending Physician'
      },
      {
        filename: `Clinical_Notes_${now.toISOString().split('T')[0]}.mp3`,
        fileType: 'audio' as const,
        mimeType: 'audio/mpeg',
        size: Math.floor(Math.random() * 2000000) + 500000, // 500KB - 2.5MB
        description: `Audio notes from clinical consultation`,
        uploadedBy: 'Attending Physician'
      }
    ],
    vital: [
      {
        filename: `Vital_Signs_Chart_${now.toISOString().split('T')[0]}.pdf`,
        fileType: 'pdf' as const,
        mimeType: 'application/pdf',
        size: Math.floor(Math.random() * 200000) + 100000, // 100KB - 300KB
        description: `Vital signs measurements and trends`,
        uploadedBy: 'Nursing Staff'
      }
    ],
    allergy: [
      {
        filename: `Allergy_Test_Results_${now.toISOString().split('T')[0]}.pdf`,
        fileType: 'pdf' as const,
        mimeType: 'application/pdf',
        size: Math.floor(Math.random() * 300000) + 150000, // 150KB - 450KB
        description: `Comprehensive allergy testing results`,
        uploadedBy: 'Allergist'
      },
      {
        filename: `Emergency_Action_Plan_${recordTitle.replace(/\s+/g, '_')}.pdf`,
        fileType: 'pdf' as const,
        mimeType: 'application/pdf',
        size: Math.floor(Math.random() * 300000) + 200000, // 200KB - 500KB
        description: `Emergency treatment protocol and action plan`,
        uploadedBy: 'Allergist'
      },
      {
        filename: `Allergy_Management_Video.mp4`,
        fileType: 'video' as const,
        mimeType: 'video/mp4',
        size: Math.floor(Math.random() * 20000000) + 10000000, // 10MB - 30MB
        description: `Educational video on allergy management`,
        uploadedBy: 'Patient Education Team',
        thumbnailUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      }
    ]
  };

  const templates = attachmentTemplates[recordType as keyof typeof attachmentTemplates] || attachmentTemplates.visit;
  
  // Randomly select 1-3 attachments
  const numAttachments = Math.floor(Math.random() * 3) + 1;
  const selectedTemplates = templates.slice(0, numAttachments);
  
  return selectedTemplates.map((template, index) => ({
    id: `att${baseId + index}`,
    filename: template.filename,
    fileType: template.fileType,
    mimeType: template.mimeType,
    size: template.size,
    uploadedAt: now.toISOString(),
    uploadedBy: template.uploadedBy,
    description: template.description,
    thumbnailUrl: template.thumbnailUrl,
    isEncrypted: Math.random() > 0.3, // 70% chance of being encrypted
    accessCount: 0,
    lastAccessed: undefined
  }));
};

export const generateRandomAttachment = (): MedicalAttachment => {
  const now = new Date();
  const fileTypes = ['pdf', 'image', 'video', 'audio', 'document'] as const;
  const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
  
  const mimeTypes = {
    pdf: 'application/pdf',
    image: 'application/dicom',
    video: 'video/mp4',
    audio: 'audio/mpeg',
    document: 'application/msword'
  };

  const filenames = {
    pdf: ['Medical_Report', 'Lab_Results', 'Prescription', 'Discharge_Summary', 'Treatment_Plan'],
    image: ['X_Ray', 'MRI_Scan', 'CT_Scan', 'Ultrasound', 'Medical_Photo'],
    video: ['Procedure_Video', 'Educational_Content', 'Consultation_Recording', 'Therapy_Session'],
    audio: ['Clinical_Notes', 'Patient_Interview', 'Consultation_Audio', 'Voice_Memo'],
    document: ['Patient_Form', 'Insurance_Document', 'Medical_History', 'Consent_Form']
  };

  const extensions = {
    pdf: '.pdf',
    image: '.dcm',
    video: '.mp4',
    audio: '.mp3',
    document: '.docx'
  };

  const uploaders = ['Dr. Smith', 'Nurse Johnson', 'Lab Technician', 'Radiologist', 'Medical Assistant', 'System'];
  
  const baseFilename = filenames[fileType][Math.floor(Math.random() * filenames[fileType].length)];
  const filename = `${baseFilename}_${now.toISOString().split('T')[0]}${extensions[fileType]}`;
  
  return {
    id: `att${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    filename,
    fileType,
    mimeType: mimeTypes[fileType],
    size: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
    uploadedAt: now.toISOString(),
    uploadedBy: uploaders[Math.floor(Math.random() * uploaders.length)],
    description: `Generated ${fileType} attachment for medical record`,
    thumbnailUrl: (fileType === 'image' || fileType === 'video') ? 
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=' : 
      undefined,
    isEncrypted: Math.random() > 0.3,
    accessCount: 0,
    lastAccessed: undefined
  };
};
