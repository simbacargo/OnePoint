import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from home.models import Product  # Adjust 'inventory' to your app name

class Command(BaseCommand):
    help = 'Imports products from a CSV or Excel file into the database.'

    def add_arguments(self, parser):
        # Add an argument to specify the path to the data file
        parser.add_argument('file_path', type=str, help='The path to the product data file (CSV or Excel).')
        
        # Add an argument for the file type
        parser.add_argument('--file-type', type=str, default='csv', 
                            help='The type of file: "csv" or "excel". (Default: csv)')

    @transaction.atomic
    def handle(self, *args, **options):
        file_path = options['file_path']
        file_type = options['file_type'].lower()
        
        # --- 1. Load Data with Pandas ---
        self.stdout.write(f"Attempting to load data from: {file_path}")
        try:
            if file_type == 'csv':
                # Assuming CSV is comma-separated
                df = pd.read_csv(file_path)
            elif file_type == 'excel':
                # Assuming the data is in the first sheet
                df = pd.read_excel(file_path)
            else:
                raise CommandError('Invalid file type specified. Use "csv" or "excel".')
                
        except FileNotFoundError:
            raise CommandError(f'File not found at path: {file_path}')
        except Exception as e:
            raise CommandError(f'Error reading file: {e}')

        # Clean column names (e.g., lowercase, replace spaces with underscores)
        df.columns = df.columns.str.lower().str.replace(' ', '_')
        
        # --- 2. Iterate and Create/Update Products ---
        products_to_create = []
        self.stdout.write(self.style.NOTICE(f"Found {len(df)} rows of data."))
        
        # Mapping file columns to model fields
        # **IMPORTANT**: Adjust these column names to match your actual file headers.
        # --- Update this section in import_products.py ---
        # Mapping file columns to model fields
        COLUMN_MAP = {
            # ----------------------------------------------------
            #   KEY: EXACT Header from your CSV/Excel file
            #   VALUE: Name of the field in your Django Product model
            # ----------------------------------------------------
            'Name of Product': 'name',          # <--- Adjusted
            'Description': 'description',       # <--- Adjusted
            'Manufacturer': 'brand',            # <--- Adjusted
            'Price (USD)': 'price',             # <--- Adjusted
            'Part No.': 'part_number',          # <--- Adjusted
            'QTY': 'quantity',                  # <--- Adjusted
            # 'details' and 'sku_or_part' were the old, incorrect placeholders
        }
        
        # Ensure required columns exist in the DataFrame
        required_cols = [col for col in COLUMN_MAP.keys() if col in df.columns]
        
        if len(required_cols) != len(COLUMN_MAP):
            missing = set(COLUMN_MAP.keys()) - set(df.columns)
            self.stdout.write(self.style.WARNING(f"Missing expected columns in your file: {', '.join(missing)}"))
            self.stdout.write(self.style.WARNING("Proceeding with available columns..."))


        for index, row in df.iterrows():
            # Create a dictionary for model fields
            product_data = {}
            
            # Map and clean data from the DataFrame row
            for file_col, model_field in COLUMN_MAP.items():
                if file_col in df.columns:
                    # Use .get() for safety, convert to string for CharField/TextField
                    value = row.get(file_col)
                    
                    if value is not None and pd.isna(value):
                        value = None # Treat NaN as None
                        
                    # Basic type conversion for numbers
                    if model_field in ['price', 'quantity']:
                        try:
                            # Use 0 if the value is missing or cannot be converted
                            product_data[model_field] = int(value) if model_field == 'quantity' else float(value)
                        except (ValueError, TypeError):
                            product_data[model_field] = 0
                    else:
                        # Default for other fields (name, description, etc.)
                        product_data[model_field] = str(value) if value is not None else ''

            # Calculate quantity_in_store and amount based on initial load
            product_data['quantity_in_store'] = product_data.get('quantity', 0)
            product_data['amount'] = product_data.get('price', 0) * product_data.get('quantity', 0)
            
            # Add to the list
            products_to_create.append(Product(**product_data))

        # --- 3. Bulk Insert (Faster way to save many objects) ---
        Product.objects.bulk_create(products_to_create)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(products_to_create)} products.'))
        self.stdout.write(self.style.WARNING('NOTE: Vehicles field was skipped. You will need to manage this via the admin or another script if needed.'))
