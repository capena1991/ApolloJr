rmdir /s /q dist
npm run tsc && xcopy .\src\data-seed\data .\dist\data /E /I
