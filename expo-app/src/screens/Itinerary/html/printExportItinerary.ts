import { useState } from 'react';
import { Alert } from 'react-native';

import * as FileSystem from "expo-file-system"
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

export const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Roteiro de Viagem</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');
              
              body { 
                font-family: 'Poppins', sans-serif; 
                font-size: 11pt; 
                line-height: 1.6; 
                padding: 35px;
                color: #333;
              }
              h1 { 
                text-align: center; 
                color: #2752b7; 
                font-size: 24pt;
                margin-bottom: 5px;
              }
              h2 {
                font-size: 16pt;
                color: #333;
                border-bottom: 2px solid #eeeeee;
                padding-bottom: 5px;
                margin-top: 25px;
              }
              ul {
                list-style-type: none;
                padding-left: 0;
              }
              li {
                padding: 8px 0px 8px 15px;
                margin-bottom: 5px;
                position: relative;
              }
              li::before {
                content: '•';
                color: #2752b7;
                font-size: 18pt;
                position: absolute;
                left: -5px;
                top: 1px;
              }
              .subtitle {
                text-align: center;
                font-size: 12pt;
                color: #777;
                margin-top: 0;
              }
            </style>
          </head>
          <body>
            <h1>Roteiro de Viagem</h1>
            <p class="subtitle">O seu roteiro de viagem personalizado com muito carinho</p>
            ${createHtmlFromItinerary(itinerary)}
          </body>
        </html>
      `;

async function handleExportPDF() {
  if (isExporting || !itinerary) {
    return;
  }

  try {
    setIsExporting(true);

    const createHtmlFromItinerary = (itineraryText: string) => {
      const days = itineraryText.split(/(Dia \d+:)/).slice(1);
      let htmlDays = '';

      for (let i = 0; i < days.length; i += 2) {
        const dayTitle = days[i];
        const activitiesText = days[i + 1];

        const activityItems = activitiesText
          .split('\n')
          .map(line => line.trim())
          .map(line => line.startsWith('-') ? line.substring(1).trim() : line)
          .filter(line => line.length > 0)
          .map(activity => `<li>${activity}</li>`)
          .join('');

        if (activityItems.length > 0) {
          htmlDays += `<h2>${dayTitle}</h2><ul>${activityItems}</ul>`;
        }
      }
      return htmlDays;
    };



    const { uri: tempUri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    const fileName = `Roteiro_de_Viagem_${new Date().toISOString().slice(0, 10)}.pdf`;
    const newUri = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.moveAsync({
      from: tempUri,
      to: newUri,
    });

    if (!await Sharing.isAvailableAsync()) {
      Alert.alert("Exportar PDF", "Compartilhamento não está disponível neste dispositivo.");
      return;
    }

    await Sharing.shareAsync(newUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Salve ou compartilhe seu roteiro',
      UTI: '.pdf'
    });

  } catch (error) {
    Alert.alert("Exportar", "Não foi possível exportar o roteiro.");
  } finally {
    setIsExporting(false);
  }
};