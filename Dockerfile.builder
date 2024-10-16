# Stage 1: Builder Image
FROM continuumio/miniconda3 as builder-conda

RUN apt-get update && apt-get -y install cmake python3-dev build-essential libgl1-mesa-glx libglib2.0-0

# Set working directory
WORKDIR /app


RUN conda install -c conda-forge conda-pack --yes

# Create a new conda environment with Python 3.11
RUN conda create --name myenv python=3.11 --yes


FROM builder-conda
# Copy requirements.txt to the container
COPY requirements.txt .

# Activate the conda environment and install dependencies using pip
RUN /bin/bash -c "source activate myenv && pip install -r requirements.txt"

# Export the environment to a tar.gz archive
RUN mkdir -p /env/ &&  conda pack -n myenv -o /env/myenv.tar.gz

# # Stage 2: Runtime Image
# FROM continuumio/miniconda3 as runtime

# # Set working directory
# WORKDIR /app

# # Copy the packed conda environment from the builder stage
# COPY --from=builder /env/myenv.tar.gz /env/

# # Use ADD to extract the packed conda environment
# ADD /env/myenv.tar.gz /env/myenv/

# # Activate the environment
# ENV PATH=/env/myenv/bin:$PATH

# # Command to run when the container starts
# CMD [ "python" ]
