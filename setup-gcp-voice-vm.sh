#!/bin/bash
# Setup Google Cloud VM for voice cloning

PROJECT_ID="upwork-voice-cloning"
VM_NAME="voice-clone-vm"
ZONE="us-central1-a"
MACHINE_TYPE="e2-standard-4"  # 4 vCPU, 16GB RAM

echo "🚀 Setting up Google Cloud VM for Voice Cloning"
echo ""
echo "Project: $PROJECT_ID"
echo "VM: $VM_NAME"
echo "Zone: $ZONE"
echo "Machine: $MACHINE_TYPE (4 vCPU, 16GB RAM)"
echo ""

# Create project if doesn't exist
echo "📦 Creating/selecting project..."
gcloud projects create $PROJECT_ID --name="Upwork Voice Cloning" 2>/dev/null || true
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔌 Enabling APIs..."
gcloud services enable compute.googleapis.com

# Create VM
echo "💻 Creating VM..."
gcloud compute instances create $VM_NAME \
  --zone=$ZONE \
  --machine-type=$MACHINE_TYPE \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --boot-disk-type=pd-standard \
  --metadata=startup-script='#!/bin/bash
    apt-get update
    apt-get install -y python3-pip ffmpeg git
    pip3 install TTS soundfile librosa
    echo "✅ VM setup complete" > /tmp/setup-complete
  '

echo ""
echo "✅ VM created! Waiting for setup to complete..."
echo ""

# Wait for VM to be ready
sleep 30

# Get VM external IP
EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo "🌐 VM External IP: $EXTERNAL_IP"
echo ""
echo "📝 Next steps:"
echo "1. SSH to VM: gcloud compute ssh $VM_NAME --zone=$ZONE"
echo "2. Upload voice sample: gcloud compute scp voice-sample.wav $VM_NAME:~/ --zone=$ZONE"
echo "3. Upload narration: gcloud compute scp narrations/narration-1.txt $VM_NAME:~/ --zone=$ZONE"
echo "4. Run voice cloning on VM"
echo "5. Download result: gcloud compute scp $VM_NAME:~/output.wav ./ --zone=$ZONE"
echo ""
echo "💰 Cost: ~\$0.15/hour (\$3.60/day)"
echo "⚠️ Remember to stop VM when done: gcloud compute instances stop $VM_NAME --zone=$ZONE"
